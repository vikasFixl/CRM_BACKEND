import LeaveRequest from "../models/LeaveRequest.js";

/**
 * EMPLOYEE CREATES LEAVE REQUEST
 */
export const createLeaveRequest = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;
    const employeeId = req.user.employeeId;

    const {
      leaveType,
      startDate,
      endDate,
      isHalfDay,
      halfDaySession,
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
        message: "halfDaySession is required for half-day leave"
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

/**
 * HR / MANAGER: GET PENDING LEAVES
 */
export const getPendingLeaveRequests = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;

    const leaves = await LeaveRequest.find({
      organizationId,
      status: "Pending"
    }).sort({ createdAt: -1 });

    res.json({ success: true, data: leaves });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * HR / MANAGER: APPROVE / REJECT LEAVE
 */
export const updateLeaveStatus = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;
    const approverId = req.user.employeeId;

    const { leaveId } = req.params;
    const { status } = req.body;

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status"
      });
    }

    const leave = await LeaveRequest.findOneAndUpdate(
      { _id: leaveId, organizationId },
      {
        status,
        approvedBy: approverId,
        approvedAt: new Date()
      },
      { new: true }
    );

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found"
      });
    }

    res.json({
      success: true,
      message: `Leave ${status.toLowerCase()}`,
      data: leave
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
