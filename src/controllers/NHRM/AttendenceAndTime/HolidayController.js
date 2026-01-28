import HolidayCalendar from "../../../models/NHRM/TimeAndAttendence/HolidayCalendar.js";
import { asyncWrapper } from "../../../middleweare/middleware.js";
import { AppError } from "../../../middleweare/errorhandler.js";
import logger from "../../../../config/logger.js";

export const createHoliday = asyncWrapper(async (req, res) => {
  const { orgId: organizationId, role } = req.user.hrm;

  if (!["Admin"].includes(role)) {
    throw new AppError("Not authorized to create holidays", 403);
  }

  const holiday = await HolidayCalendar.create({
    organizationId,
    ...req.body
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



export const updateHoliday = asyncWrapper(async (req, res) => {
  const { holidayId } = req.params;
  const { orgId: organizationId, role } = req.user.hrm;

  if (!["Admin"].includes(role)) {
    throw new AppError("Not authorized to update holidays", 403);
  }

  const allowedFields = ["name", "type", "isPaid", "locationId", "isActive"];
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

  if (!["Admin"].includes(role)) {
    throw new AppError("Not authorized to disable holidays", 403);
  }

  const holiday = await HolidayCalendar.findOneAndUpdate(
    { _id: holidayId, organizationId },
    { isActive: false },
    { new: true }
  );

  if (!holiday) {
    throw new AppError("Holiday not found", 404);
  }

  logger.info("Holiday disabled", { holidayId });

  res.status(200).json({
    success: true,
    message: "Holiday disabled successfully"
  });
});

