import RawTimeLog from "../../../models/NHRM/TimeAndAttendence/RawTimeLog.js";
import {
  generateDedupKey,
  resolveLogicalDay
} from "../../../utils/helperfuntions/generateInviteCode.js";
import { EmployeeProfile } from "../../../models/NHRM/employeeManagement/employeeProfile.js";
import { asyncWrapper } from "../../../middleweare/middleware.js";
import { AppError } from "../../../middleweare/errorhandler.js";
import AttendancePolicy from "../../../models/NHRM/TimeAndAttendence/AttendancePolicy.js";
import logger from "../../../../config/logger.js";
import HolidayCalendar from "../../../models/NHRM/TimeAndAttendence/HolidayCalendar.js";

export const punch = asyncWrapper(async (req, res) => {
  const { sub: employeeId, orgId } = req.user.hrm;
  const { punchType, source = "web", deviceId } = req.body;

  if (!["IN", "OUT"].includes(punchType)) {
    throw new AppError("Invalid punch type", 400);
  }

  
  /* 1️⃣ Fetch employee */
  const employee = await EmployeeProfile.findOne({
    _id: employeeId,
    organizationId: orgId,
    deletedAt: null
  });
  logger.info(employee);

  if (!employee) {
    throw new AppError("Employee profile not found", 404);
  }

  /* 2️⃣ Eligibility checks */
  if (!employee.isActive || employee.status !== "Active") {
    throw new AppError("Employee is not active", 403);
  }

  const today = resolveLogicalDay(new Date());
  if (today < resolveLogicalDay(employee.joinDate)) {
    throw new AppError("Attendance not applicable before joining date", 403);
  }

  /* 3️⃣ Attendance system readiness */
  const policyExists = await AttendancePolicy.exists({
    organizationId: orgId,
    isActive: true
  });
  logger.info(`Attendance policy exists: ${policyExists}`);
  if (!policyExists) {
    throw new AppError("Attendance policy not configured", 409);
  }

  /* 4️⃣ Log raw punch */
  const now = new Date();
  const logicalDay = resolveLogicalDay(now);
  /* 3️⃣ Holiday restriction check */
const holiday = await HolidayCalendar.findOne({
  organizationId: orgId,
  date: logicalDay,
  isActive: true
});

if (holiday && holiday.isMandatory) {
  throw new AppError(
    `Punch not allowed. Today is a mandatory holiday (${holiday.name})`,
    403
  );
}


  const dedupKey = generateDedupKey({
    employeeId,
    logicalDay,
    punchType,
    source,
    deviceId
  });

  logger.info(`Generated dedupKey: ${dedupKey}`);
  try {
    const log = await RawTimeLog.create({
      organizationId: orgId,
      employeeId,
      timestamp: now,
      logicalDay,
      punchType,
      source,
      deviceId,
      ipAddress: req.ip,
      dedupKey
    });

    logger.info(`Punch logged: ${log._id} ${log}`);
    res.status(201).json({
      success: true,
      message: `Punch ${punchType} recorded`,
      data: log
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(200).json({
        success: true,
        message: "Duplicate punch ignored"
      });
    }
    throw err;
  }
});

export const getTodayPunches = asyncWrapper(async (req, res) => {
  const { sub: employeeId, orgId: organizationId } = req.user.hrm;

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const logs = await RawTimeLog.find({
    organizationId,
    employeeId,
    logicalDay: today
  }).sort({ timestamp: 1 });


  const response = logs.map(log => ({
    punchType: log.punchType,
    source: log.source,
    timestamp: log.timestamp,
    logicalDay: log.logicalDay
  }));
  res.status(200).json({
    success: true,
    data: response
  });
});

export const getEmployeeRawLogs = asyncWrapper(async (req, res) => {
  const { orgId: organizationId } = req.user.hrm;
  const { employeeId } = req.params;
  const { from, to } = req.query;

  const query = { organizationId, employeeId };

  if (from && to) {
    query.timestamp = {
      $gte: new Date(from),
      $lte: new Date(to)
    };
  }

  const logs = await RawTimeLog.find(query)
    .sort({ timestamp: 1 })
    .limit(2000);

  res.status(200).json({
    success: true,
    data: logs
  });
});



