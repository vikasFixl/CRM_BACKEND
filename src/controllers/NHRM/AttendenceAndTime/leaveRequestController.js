import LeaveRequest from "../../../models/NHRM/TimeAndAttendence/LeaveRequest.js";

export const createLeaveRequest = async (req, res) => {
  try {
    const { organizationId, employeeId } = req.user;
    const {
      leaveType,
      startDate,
      endDate,
      isHalfDay,
      halfDaySession,
      hours,
      reason
    } = req.body;

    if (!leaveType || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "leaveType, startDate and endDate are required"
      });
    }

    if (isHalfDay && !halfDaySession) {
      return res.status(400).json({
        success: false,
        message: "halfDaySession required for half day leave"
      });
    }

    // Basic overlap guard (soft)
    const overlap = await LeaveRequest.findOne({
      organizationId,
      employeeId,
      status: { $in: ["Pending", "Approved"] },
      $or: [
        { startDate: { $lte: endDate }, endDate: { $gte: startDate } }
      ]
    });

    if (overlap) {
      return res.status(409).json({
        success: false,
        message: "Overlapping leave request already exists"
      });
    }

    const leave = await LeaveRequest.create({
      organizationId,
      employeeId,
      leaveType,
      startDate,
      endDate,
      isHalfDay,
      halfDaySession,
      hours,
      reason
    });

    res.status(201).json({
      success: true,
      message: "Leave request submitted",
      data: leave
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
export const getMyLeaveRequests = async (req, res) => {
  try {
    const { organizationId, employeeId } = req.user;

    const requests = await LeaveRequest.find({
      organizationId,
      employeeId
    }).sort({ createdAt: -1 });

    res.json({ success: true, data: requests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getPendingLeaveRequests = async (req, res) => {
  try {
    const organizationId = req.orgUser.orgId;

    const requests = await LeaveRequest.find({
      organizationId,
      status: "Pending"
    }).sort({ createdAt: 1 });

    res.json({ success: true, data: requests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const approveLeaveRequest = async (req, res) => {
  try {
    const organizationId = req.orgUser.orgId;
    const approverId = req.user.userId;
    const { id } = req.params;

    const leave = await LeaveRequest.findOne({
      _id: id,
      organizationId,
      status: "Pending"
    });

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found or already processed"
      });
    }

    leave.status = "Approved";
    leave.approvedBy = approverId;
    leave.approvedAt = new Date();

    await leave.save();

    res.json({
      success: true,
      message: "Leave approved",
      data: leave
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const rejectLeaveRequest = async (req, res) => {
  try {
    const organizationId = req.orgUser.orgId;
    const approverId = req.user.userId;
    const { id } = req.params;
    const { reason } = req.body;

    const leave = await LeaveRequest.findOne({
      _id: id,
      organizationId,
      status: "Pending"
    });

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found or already processed"
      });
    }

    leave.status = "Rejected";
    leave.approvedBy = approverId;
    leave.approvedAt = new Date();
    leave.reason = reason || leave.reason;

    await leave.save();

    res.json({
      success: true,
      message: "Leave rejected",
      data: leave
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

