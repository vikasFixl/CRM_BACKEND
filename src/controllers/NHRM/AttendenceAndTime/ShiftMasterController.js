import { asyncWrapper } from "../../../middleweare/middleware.js";
import { AppError } from "../../../middleweare/errorhandler.js";

import EmployeeShiftAssignment from "../../../models/NHRM/TimeAndAttendence/EmployeeShiftAssignment.js";
import ShiftMaster from "../../../models/NHRM/TimeAndAttendence/ShiftMaster.js";
import { HrmAuditLog } from "../../../models/NHRM/logs/HrmLogs.js";

export const createShift = asyncWrapper(async (req, res) => {
  const { orgId: organizationId, sub: userId, role } = req.user.hrm;

  const shift = await ShiftMaster.create({
    organizationId,
    ...req.body
  });

  await HrmAuditLog.create({
    organizationId,
    actorId: userId,
    actorRole: role,
    entityType: "Shift",
    entityId: shift._id,
    action: "CREATE",
    message: `Shift created: ${shift.shiftType}`,
    after: shift.toObject(),
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"]
  });

  res.status(201).json({
    success: true,
    message: "Shift created successfully",
    data: shift
  });
});

export const getActiveShifts = asyncWrapper(async (req, res) => {
  const { orgId: organizationId } = req.user.hrm;

  const shifts = await ShiftMaster.find({
    organizationId,
    isActive: true
  }).sort({ shiftType: 1, createdAt: -1 });

  res.status(200).json({
    success: true,
    message: "Shifts fetched successfully",
    data: shifts
  });
});

export const updateShift = asyncWrapper(async (req, res) => {
  const { shiftId } = req.params;
  const { orgId: organizationId, sub: userId, role } = req.user.hrm;

  const allowedUpdates = [
    "graceInMinutes",
    "graceOutMinutes",
    "isActive"
  ];

  const updates = {};
  allowedUpdates.forEach((key) => {
    if (req.body[key] !== undefined) {
      updates[key] = req.body[key];
    }
  });

  const before = await ShiftMaster.findOne({ _id: shiftId, organizationId });
  if (!before) {
    throw new AppError("Shift not found", 404);
  }

  const updated = await ShiftMaster.findOneAndUpdate(
    { _id: shiftId, organizationId },
    updates,
    { new: true, runValidators: true }
  );

  await HrmAuditLog.create({
    organizationId,
    actorId: userId,
    actorRole: role,
    entityType: "Shift",
    entityId: updated._id,
    action: "UPDATE",
    message: `Shift updated: ${updated.shiftType}`,
    before: before.toObject(),
    after: updated.toObject(),
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"]
  });

  res.status(200).json({
    success: true,
    message: "Shift updated successfully",
    data: updated
  });
});
export const disableShift = asyncWrapper(async (req, res) => {
  const { shiftId } = req.params;
  const { orgId: organizationId, sub: userId, role } = req.user.hrm;

  const activeAssignments = await EmployeeShiftAssignment.exists({
    organizationId,
    shiftId,
    isActive: true
  });

  if (activeAssignments) {
    throw new AppError(
      "Cannot disable shift while employees are assigned",
      400
    );
  }

  const before = await ShiftMaster.findOne({ _id: shiftId, organizationId });
  if (!before) {
    throw new AppError("Shift not found", 404);
  }

  const shift = await ShiftMaster.findOneAndUpdate(
    { _id: shiftId, organizationId },
    { isActive: false },
    { new: true }
  );

  await HrmAuditLog.create({
    organizationId,
    actorId: userId,
    actorRole: role,
    entityType: "Shift",
    entityId: shift._id,
    action: "LOCK",
    message: `Shift disabled: ${shift.shiftType}`,
    before: before.toObject(),
    after: shift.toObject(),
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"]
  });

  res.status(200).json({
    success: true,
    message: "Shift disabled successfully"
  });
});

export const getShiftById = asyncWrapper(async (req, res) => {
  const { shiftId } = req.params;
  const { orgId: organizationId } = req.user.hrm;
  const shift = await ShiftMaster.findOne({
    _id: shiftId,
    organizationId,
    isActive: true
  });

  if (!shift) {
    throw new AppError("Shift not found", 404);
  }
  res.status(200).json({
    success: true,
    message: "Shift fetched successfully",
    data: shift
  });
}
);