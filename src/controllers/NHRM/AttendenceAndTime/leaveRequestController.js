import LeaveRequest from "../../../models/NHRM/TimeAndAttendence/LeaveRequest.js";
import LeaveType from "../../../models/NHRM/TimeAndAttendence/LeaveType.js";
import { asyncWrapper } from "../../../middleweare/middleware.js";
import { AppError } from "../../../middleweare/errorhandler.js";

export const createLeaveRequest = asyncWrapper(async (req, res) => {
  const { orgId: organizationId, sub: employeeId } = req.user.hrm;

  const {
    leaveType: leaveTypeId,
    startDate,
    endDate,
    isHalfDay,
    halfDaySession,
    reason
  } = req.body;

  if (!leaveTypeId || !startDate || !endDate) {
    throw new AppError("leaveType, startDate and endDate are required", 400);
  }

  const leaveType = await LeaveType.findOne({
    _id: leaveTypeId,
    organizationId,
    isActive: true
  });

  if (!leaveType) {
    throw new AppError("Invalid or inactive leave type", 400);
  }

  if (isHalfDay) {
    if (!leaveType.allowHalfDay) {
      throw new AppError("Half-day not allowed for this leave type", 400);
    }
    if (!halfDaySession) {
      throw new AppError("halfDaySession is required for half-day leave", 400);
    }
  }

  // Overlap check
  const overlap = await LeaveRequest.findOne({
    organizationId,
    employeeId,
    status: { $in: ["Pending", "Approved"] },
    startDate: { $lte: new Date(endDate) },
    endDate: { $gte: new Date(startDate) }
  });

  if (overlap) {
    throw new AppError("Overlapping leave request already exists", 409);
  }

  const leave = await LeaveRequest.create({
    organizationId,
    employeeId,
    leaveType: leaveTypeId,
    startDate,
    endDate,
    isHalfDay,
    halfDaySession,
    reason,
    status: "Pending"
  });

  res.status(201).json({
    success: true,
    message: "Leave request submitted",
    data: leave
  });
});

export const getMyLeaveRequests = asyncWrapper(async (req, res) => {
  const { orgId: organizationId, sub: employeeId } = req.user.hrm;

  const requests = await LeaveRequest.find({
    organizationId,
    employeeId
  }).sort({ createdAt: -1 });

  res.status(200).json({ success: true, data: requests });
});

export const getPendingLeaveRequests = asyncWrapper(async (req, res) => {
  const { orgId: organizationId, role } = req.user.hrm;


  const requests = await LeaveRequest.find({
    organizationId,
    status: "Pending"
  }).sort({ createdAt: 1 });

  res.status(200).json({ success: true, data: requests });
});

export const approveLeaveRequest = asyncWrapper(async (req, res) => {
  const { orgId: organizationId, userId, role } = req.user.hrm;
  const { id } = req.params;


  const leave = await LeaveRequest.findOne({
    _id: id,
    organizationId,
    status: "Pending"
  });

  if (!leave) {
    throw new AppError("Leave request not found or already processed", 404);
  }

  leave.status = "Approved";
  leave.approvedBy = userId;
  leave.approvedAt = new Date();

  await leave.save();

  res.status(200).json({
    success: true,
    message: "Leave approved",
    data: leave
  });
});
export const rejectLeaveRequest = asyncWrapper(async (req, res) => {
  const { orgId: organizationId, userId, role } = req.user.hrm;
  const { id } = req.params;
  const { reason } = req.body;


  if (!reason || reason.trim().length < 3) {
    throw new AppError("Rejection reason is required", 400);
  }

  const leave = await LeaveRequest.findOne({
    _id: id,
    organizationId,
    status: "Pending"
  });

  if (!leave) {
    throw new AppError("Leave request not found or already processed", 404);
  }

  leave.status = "Rejected";
  leave.approvedBy = userId;
  leave.approvedAt = new Date();
  leave.rejectionReason = reason;

  await leave.save();

  res.status(200).json({
    success: true,
    message: "Leave rejected",
    data: leave
  });
});
