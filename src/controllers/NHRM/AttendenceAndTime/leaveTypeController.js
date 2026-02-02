import LeaveType from "../../../models/NHRM/TimeAndAttendence/LeaveType.js";
import { asyncWrapper } from "../../../middleweare/middleware.js";
import { AppError } from "../../../middleweare/errorhandler.js";
import { HrmAuditLog } from "../../../models/NHRM/logs/HrmLogs.js";

export const createLeaveType = asyncWrapper(async (req, res) => {
  const { orgId: organizationId } = req.user.hrm;
  const leaveType = await LeaveType.create({
    organizationId,
    ...req.body
  });

  await HrmAuditLog.create({
    organizationId,
    actorId: userId,
    actorRole: role,
    entityType: "LeaveType",
    entityId: leaveType._id,
    action: "CREATE",
    message: `Leave type created: ${leaveType.name} (${leaveType.code})`,
    after: leaveType.toObject(),
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"]
  });
  res.status(201).json({
    success: true,
    data: leaveType
  });
});


export const getActiveLeaveTypes = asyncWrapper(async (req, res) => {
  const { orgId: organizationId } = req.user.hrm;

  const leaveTypes = await LeaveType.find({
    organizationId,
    isActive: true
  }).sort({ name: 1 });

  res.status(200).json({
    success: true,
    data: leaveTypes
  });
});

export const updateLeaveType = asyncWrapper(async (req, res) => {
  const { leaveTypeId } = req.params;
  const { orgId: organizationId } = req.user.hrm;


  // 🔒 Hard-block dangerous fields
  delete req.body.isPaid;
  delete req.body.organizationId;
  delete req.body.code;

  const updated = await LeaveType.findOneAndUpdate(
    { _id: leaveTypeId, organizationId },
    req.body,
    { new: true, runValidators: true }
  );

  if (!updated) {
    throw new AppError("Leave type not found", 404);
  }
  await HrmAuditLog.create({
    organizationId,
    actorId: userId,
    actorRole: role,
    entityType: "LeaveType",
    entityId: updated._id,
    action: "UPDATE",
    message: `Leave type updated: ${updated.name}`,
    before: before.toObject(),
    after: updated.toObject(),
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"]
  });

  res.status(200).json({
    success: true,
    data: updated
  });
});

export const disableLeaveType = asyncWrapper(async (req, res) => {
  const { leaveTypeId } = req.params;
  const { orgId: organizationId } = req.user.hrm;


  const disabled = await LeaveType.findOneAndDelete(
    { _id: leaveTypeId, organizationId }
  );

  if (!disabled) {
    throw new AppError("Leave type not found", 404);
  }
   await HrmAuditLog.create({
    organizationId,
    actorId: userId,
    actorRole: role,
    entityType: "LeaveType",
    entityId: disabled._id,
    action: "LOCK",
    message: `Leave type disabled: ${disabled.name}`,
    before: before.toObject(),
    after: disabled.toObject(),
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"]
  });

  res.status(200).json({
    success: true,
    message: "Leave type disabled"
  });
});

