import logger from "../../config/logger.js";
import DailyAttendance from "../models/NHRM/TimeAndAttendence/DailyAttendance.js";
import RawTimeLog from "../models/NHRM/TimeAndAttendence/RawTimeLog.js";
import EmployeeShiftAssignment from "../models/NHRM/TimeAndAttendence/EmployeeShiftAssignment.js";
import AttendancePolicy from "../models/NHRM/TimeAndAttendence/AttendancePolicy.js";

/**
 * Derive DailyAttendance for one organization & one date
 */
export const deriveAttendanceForDate = async ({
  organizationId,
  date
}) => {
  const dayStart = new Date(date);
  dayStart.setUTCHours(0, 0, 0, 0);

  logger.info("[AttendanceDerivation] Started", {
    organizationId,
    date: dayStart.toISOString()
  });

  /* 1️⃣ Load policy */
  const policy = await AttendancePolicy.findOne({
    organizationId,
    isActive: true
  });

  if (!policy) {
    logger.error("[AttendanceDerivation] No active policy found", {
      organizationId
    });
    throw new Error("Attendance policy not configured");
  }

  logger.info("[AttendanceDerivation] Policy loaded", {
    lateAllowedMinutes: policy.lateAllowedMinutes,
    halfDayThresholdMinutes: policy.halfDayThresholdMinutes,
    absentThresholdMinutes: policy.absentThresholdMinutes
  });

  /* 2️⃣ Fetch raw logs */
  const rawLogs = await RawTimeLog.find({
    organizationId,
    logicalDay: dayStart
  }).sort({ timestamp: 1 });

  if (!rawLogs.length) {
    logger.info("[AttendanceDerivation] No raw logs found", {
      organizationId,
      date: dayStart.toISOString()
    });
    return;
  }

  /* 3️⃣ Group logs by employee */
  const logsByEmployee = new Map();

  for (const log of rawLogs) {
    const key = log.employeeId.toString();
    if (!logsByEmployee.has(key)) {
      logsByEmployee.set(key, []);
    }
    logsByEmployee.get(key).push(log);
  }

  logger.info("[AttendanceDerivation] Employees to process", {
    count: logsByEmployee.size
  });

  /* 4️⃣ Process each employee */
  for (const [employeeId, logs] of logsByEmployee.entries()) {
    logger.info("[AttendanceDerivation] Processing employee", {
      employeeId,
      punches: logs.length
    });

    /* 🔒 Skip if locked */
    const existing = await DailyAttendance.findOne({
      organizationId,
      employeeId,
      date: dayStart
    });

    if (existing?.isLocked) {
      logger.warn("[AttendanceDerivation] Skipped locked attendance", {
        employeeId,
        date: dayStart.toISOString()
      });
      continue;
    }

    /* 5️⃣ Resolve shift assignment */
    const assignment = await EmployeeShiftAssignment.findOne({
      organizationId,
      employeeId,
        isActive: true,
     
    }).populate("shiftId");

    if (!assignment) {
      logger.warn("[AttendanceDerivation] No shift assignment found", {
        employeeId
      });

      await upsertAttendance({
        organizationId,
        employeeId,
        dayStart,
        status: "Absent"
      });
      continue;
    }

    const shift = assignment.shiftId;

    logger.info("[AttendanceDerivation] Shift resolved", {
      employeeId,
      shiftId: shift._id,
      shiftStart: shift.startTime,
      shiftEnd: shift.endTime
    });

    /* 6️⃣ Extract punches */
    const inPunches = logs.filter(l => l.punchType === "IN");
    const outPunches = logs.filter(l => l.punchType === "OUT");

    const firstIn = inPunches[0]?.timestamp || null;
    const lastOut = outPunches[outPunches.length - 1]?.timestamp || null;

    if (!firstIn && !lastOut) {
      logger.info("[AttendanceDerivation] No punches → Absent", {
        employeeId
      });

      await upsertAttendance({
        organizationId,
        employeeId,
        dayStart,
        shift,
        status: "Absent"
      });
      continue;
    }

    if (firstIn && !lastOut) {
      logger.info("[AttendanceDerivation] Missing OUT → HalfDay", {
        employeeId,
        firstIn
      });

      await upsertAttendance({
        organizationId,
        employeeId,
        dayStart,
        shift,
        firstIn,
        status: "HalfDay"
      });
      continue;
    }

    /* 7️⃣ Calculate work minutes */
    const totalWorkMinutes =
      Math.floor((lastOut - firstIn) / 60000) -
      shift.breakMinutes;

    /* 8️⃣ Shift start & late calculation */
    const [sh, sm] = shift.startTime.split(":").map(Number);
    const shiftStart = new Date(dayStart);
    shiftStart.setUTCHours(sh, sm, 0, 0);

    const lateMinutes = Math.max(
      0,
      Math.floor((firstIn - shiftStart) / 60000) -
        policy.lateAllowedMinutes
    );

    /* 9️⃣ Decide status */
    let status = "Present";

    if (totalWorkMinutes < policy.halfDayThresholdMinutes) {
      status = "HalfDay";
    }

    if (totalWorkMinutes < policy.absentThresholdMinutes) {
      status = "Absent";
    }

    /* 🔟 Overtime */
    const shiftDuration =
      (parseInt(shift.endTime.split(":")[0]) * 60 +
        parseInt(shift.endTime.split(":")[1])) -
      (sh * 60 + sm);

    const overtimeMinutes =
      totalWorkMinutes >
      shiftDuration + policy.overtimeMinMinutes
        ? totalWorkMinutes - shiftDuration
        : 0;

    logger.info("[AttendanceDerivation] Computed metrics", {
      employeeId,
      totalWorkMinutes,
      lateMinutes,
      overtimeMinutes,
      status
    });

    /* 1️⃣1️⃣ Upsert DailyAttendance */
    await upsertAttendance({
      organizationId,
      employeeId,
      dayStart,
      shift,
      firstIn,
      lastOut,
      totalWorkMinutes,
      lateMinutes,
      overtimeMinutes,
      status
    });
  }

  logger.info("[AttendanceDerivation] Completed", {
    organizationId,
    date: dayStart.toISOString()
  });
};

/* 🔧 Helper */
const upsertAttendance = async ({
  organizationId,
  employeeId,
  dayStart,
  shift,
  firstIn = null,
  lastOut = null,
  totalWorkMinutes = 0,
  lateMinutes = 0,
  overtimeMinutes = 0,
  status
}) => {
  await DailyAttendance.updateOne(
    {
      organizationId,
      employeeId,
      date: dayStart
    },
    {
      $set: {
        organizationId,
        employeeId,
        date: dayStart,
        shiftId: shift?._id,
        shiftStartTime: shift?.startTime,
        shiftEndTime: shift?.endTime,
        firstIn,
        lastOut,
        totalWorkMinutes,
        lateMinutes,
        overtimeMinutes,
        status,
        source: "system"
      }
    },
    { upsert: true }
  );

  logger.info("[AttendanceDerivation] Attendance upserted", {
    employeeId,
    date: dayStart.toISOString(),
    status
  });
};

