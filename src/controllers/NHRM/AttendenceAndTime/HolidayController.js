import HolidayCalendar from "../../../models/NHRM/TimeAndAttendence/HolidayCalendar.js";
import { asyncWrapper } from "../../../middleweare/middleware.js";
import { AppError } from "../../../middleweare/errorhandler.js";
import logger from "../../../../config/logger.js";
import { HrmAuditLog } from "../../../models/NHRM/logs/HrmLogs.js";

export const createHoliday = asyncWrapper(async (req, res) => {
  const { orgId: organizationId } = req.user.hrm;



  const holiday = await HolidayCalendar.create({
    organizationId,
    ...req.body
  });
   await HrmAuditLog.create({
    organizationId,
    actorId: userId,
    actorRole: role,
    entityType: "Holiday",
    entityId: holiday._id,
    action: "CREATE",
    message: `Holiday created: ${holiday.name} (${holiday.date.toDateString()})`,
    after: holiday.toObject(),
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"]
  });

  logger.info("Holiday created", {
    organizationId,
    date: holiday.date,
    name: holiday.name
  });

  res.status(201).json({
    success: true,
    message: "Holiday created successfully",
    data: holiday
  });
});


export const getHolidays = asyncWrapper(async (req, res) => {
  const { orgId: organizationId } = req.user.hrm;
  const { year } = req.query;

  if (!year) {
    throw new AppError("year is required", 400);
  }

  const start = new Date(`${year}-01-01`);
  const end = new Date(`${year}-12-31`);

  const holidays = await HolidayCalendar.find({
    organizationId,
    isActive: true,
    date: { $gte: start, $lte: end }
  }).sort({ date: 1 });

  res.status(200).json({
    success: true,
    data: holidays
  });
});



export const getHolidayById = asyncWrapper(async (req, res) => {
  const { holidayId } = req.params;
  const { orgId: organizationId } = req.user.hrm;

  const holiday = await HolidayCalendar.findOne({
    _id: holidayId,
    organizationId,
    isActive: true
  });

  if (!holiday) {
    throw new AppError("Holiday not found", 404);
  }

  res.status(200).json({
    success: true,
    data: holiday
  });
});

export const updateHoliday = asyncWrapper(async (req, res) => {
  const { holidayId } = req.params;
  const { orgId: organizationId } = req.user.hrm;



  const allowedFields = ["name", "type", "isPaid", "locationId", "isActive","isMandatory"];
  const updates = {};

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  const updated = await HolidayCalendar.findOneAndUpdate(
    { _id: holidayId, organizationId },
    updates,
    { new: true, runValidators: true }
  );

  if (!updated) {
    throw new AppError("Holiday not found", 404);
  }

  await HrmAuditLog.create({
    organizationId,
    actorId: userId,
    actorRole: role,
    entityType: "Holiday",
    entityId: updated._id,
    action: "UPDATE",
    message: `Holiday updated: ${updated.name}`,
    before: before.toObject(),
    after: updated.toObject(),
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"]
  });

  logger.info("Holiday updated", {
    holidayId,
    updates
  });

  res.status(200).json({
    success: true,
    message: "Holiday updated successfully",
    data: updated
  });
});

export const disableHoliday = asyncWrapper(async (req, res) => {
  const { holidayId } = req.params;
  const { orgId: organizationId, role } = req.user.hrm;

 

  const holiday = await HolidayCalendar.findOneAndDelete(
    { _id: holidayId, organizationId }
  );

  if (!holiday) {
    throw new AppError("Holiday not found", 404);
  }

   await HrmAuditLog.create({
    organizationId,
    actorId: userId,
    actorRole: role,
    entityType: "Holiday",
    entityId: holiday._id,
    action: "DELETE",
    message: `Holiday deleted: ${holiday.name} (${holiday.date.toDateString()})`,
    before: holiday.toObject(),
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"]
  });
  res.status(200).json({
    success: true,
    message: "Holiday deleted successfully"
  });
});

