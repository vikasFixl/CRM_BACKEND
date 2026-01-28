import DailyAttendance from "../../../models/NHRM/TimeAndAttendence/DailyAttendance.js";
import { asyncWrapper } from "../../../middleweare/middleware.js";
import { AppError } from "../../../middleweare/errorhandler.js";
import logger from "../../../../config/logger.js";
import { HrmAuditLog } from "../../../models/NHRM/logs/HrmLogs.js";

export const getMyAttendance = asyncWrapper(async (req, res) => {
  const { sub: employeeId, orgId: organizationId } = req.user.hrm;
  let { from, to } = req.query;

  // 📌 Default: today
  if (!from && !to) {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    from = today;
    to = today;
  }

  // ❌ One provided, one missing
  if ((from && !to) || (!from && to)) {
    throw new AppError("Both from and to dates are required", 400);
  }



  const records = await DailyAttendance.find({
    organizationId,
    employeeId,
    attendanceDate: {
      $gte: new Date(from),
      $lte: new Date(to)
    }
  })
    .sort({ attendanceDate: 1 })
    .lean();

  const mapAttendanceResponse = (doc) => ({
    _id: doc._id,
    date: doc.date,
    status: doc.status,
    firstIn: doc.firstIn,
    lastOut: doc.lastOut,
    workMinutes: doc.totalWorkMinutes,
    lateMinutes: doc.lateMinutes,
    earlyMinutes: doc.earlyMinutes,
    overtimeMinutes: doc.overtimeMinutes,
    shift: {
      start: doc.shiftStartTime,
      end: doc.shiftEndTime
    }
  });

  const data = records.map(mapAttendanceResponse);

  res.status(200).json({
    success: true,
    data
  });
});

export const getEmployeeAttendance = asyncWrapper(async (req, res) => {
  const { orgId: organizationId } = req.user.hrm;
  const { employeeId } = req.params;
  let { from, to } = req.query;

  //  Default: today
  if (!from && !to) {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    from = today;
    to = today;
  }

  //  One provided, one missing
  if ((from && !to) || (!from && to)) {
    throw new AppError("Both from and to dates are required", 400);
  }


  const data = await DailyAttendance.find({
    organizationId,
    employeeId,
    attendanceDate: {
      $gte: new Date(from),
      $lte: new Date(to)
    }
  })
    .populate("shiftId")
    .sort({ attendanceDate: 1 });

  res.status(200).json({
    success: true,
    data
  });
});


export const overrideAttendance = asyncWrapper(async (req, res) => {
  const { orgId: organizationId, userId } = req.user.hrm;
  const { attendanceId } = req.params;
  const { status, remarks } = req.body;

  const attendance = await DailyAttendance.findOne({
    _id: attendanceId,
    organizationId,
    isLocked: false
  });

  if (!attendance) {
    throw new AppError("Attendance not found or already locked", 404);
  }
  /* 🧠 Capture BEFORE snapshot */
  const beforeSnapshot = {
    status: attendance.status,
    firstIn: attendance.firstIn,
    lastOut: attendance.lastOut,
    totalWorkMinutes: attendance.totalWorkMinutes
  };

  attendance.status = status;
  attendance.source = "manual";
  attendance.remarks = remarks;
  attendance.overriddenBy = userId;
  attendance.overriddenAt = new Date();

  await attendance.save();
  try {
    await HrmAuditLog.create({
      organizationId,
      actorId: userId,
      entityType: "Attendance",
      entityId: attendance._id,
      action: "OVERRIDE",
      message: remarks,
      before: beforeSnapshot,
      after: {
        status
      },
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });
  } catch (auditErr) {
    // ❗ DO NOT throw
    logger.error("Audit log failed for attendance override", auditErr);
  }

  res.status(200).json({
    success: true,
    message: "Attendance overridden successfully",
    data: attendance
  });
});


export const lockAttendanceForPayroll = asyncWrapper(async (req, res) => {
  const { orgId: organizationId, userId } = req.user.hrm;
  const { from, to } = req.body;

  if (!from || !to) {
    throw new AppError("from and to dates are required", 400);
  }

  await DailyAttendance.updateMany(
    {
      organizationId,
      date: {
        $gte: new Date(from),
        $lte: new Date(to)
      }
    },
    {
      $set: {
        isLocked: true,
        lockedAt: new Date(),
        lockedBy: userId
      }
    }
  );

  // 🔍 AUDIT LOG
  try {
    await HrmAuditLog.create({
      organizationId,
      actorId: userId,
      entityType: "Attendance",
      entityId: null,
      action: "LOCK",
      message: `Payroll attendance locked from ${from} to ${to}`,
      before: { locked: false },
      after: { locked: true },
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });
  } catch (err) {
    logger.error("Audit log failed (lockAttendanceForPayroll)", err);
  }

  res.status(200).json({
    success: true,
    message: "Attendance locked for payroll"
  });
});

export const lockEmployeeAttendance = asyncWrapper(async (req, res) => {
  const { orgId: organizationId, userId } = req.user.hrm;
  const { employeeId } = req.params;
  const { from, to } = req.body;

  if (!from || !to) {
    throw new AppError("from and to dates are required", 400);
  }

  await DailyAttendance.updateMany(
    {
      organizationId,
      employeeId,
      date: {
        $gte: new Date(from),
        $lte: new Date(to)
      }
    },
    {
      $set: {
        isLocked: true,
        lockedAt: new Date(),
        lockedBy: userId
      }
    }
  );

  // 🔍 AUDIT LOG
  try {
    await HrmAuditLog.create({
      organizationId,
      actorId: userId,
      entityType: "Attendance",
      entityId: employeeId,
      action: "LOCK",
      message: `Employee attendance locked from ${from} to ${to}`,
      before: { locked: false },
      after: { locked: true },
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });
  } catch (err) {
    logger.error("Audit log failed (lockEmployeeAttendance)", err);
  }

  res.status(200).json({
    success: true,
    message: "Employee attendance locked"
  });
});

export const unlockEmployeeAttendance = asyncWrapper(async (req, res) => {
  const { orgId: organizationId, userId} = req.user.hrm;
  const { employeeId } = req.params;
  const { from, to, reason } = req.body;
  logger.info(`Unlock request by ${userId} for employee ${employeeId} from ${from} to ${to} Reason: ${reason}`);

  if (!from || !to || !reason) {
    throw new AppError("from, to and reason are required", 400);
  }

  await DailyAttendance.updateMany(
    {
      organizationId,
      employeeId,
      date: {
        $gte: new Date(from),
        $lte: new Date(to)
      }
    },
    {
      $set: {
        isLocked: false,
        lockedAt: null,
        lockedBy: null,
        unlockedAt: new Date(),
        unlockedBy: userId
      }
    }
  );

  // 🔍 AUDIT LOG (MANDATORY)
  try {
    await HrmAuditLog.create({
      organizationId,
      actorId: userId,

      entityType: "Attendance",
      entityId: employeeId,
      action: "UNLOCK",
      message: reason,
      before: { locked: true },
      after: { locked: false },
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });
  } catch (err) {
    logger.error("Audit log failed (unlockEmployeeAttendance)", err);
  }

  res.status(200).json({
    success: true,
    message: "Employee attendance unlocked temporarily"
  });
});






