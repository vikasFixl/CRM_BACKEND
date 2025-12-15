import LeaveBalance from "../models/LeaveBalance.js";
import LeaveType from "../models/LeaveType.js";

/**
 * =========================================================
 * EMPLOYEE: GET OWN LEAVE BALANCES (READ ONLY)
 * =========================================================
 */
export const getMyLeaveBalances = async (req, res) => {
  try {
    const { organizationId, employeeId } = req.user;
    const year = Number(req.query.year) || new Date().getFullYear();

    const balances = await LeaveBalance.find({
      organizationId,
      employeeId,
      year,
      isActive: true
    }).populate("leaveTypeId");

    return res.json({
      success: true,
      data: balances
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

/**
 * =========================================================
 * HR / ADMIN: GET EMPLOYEE LEAVE BALANCES
 * =========================================================
 */
export const getEmployeeLeaveBalances = async (req, res) => {
  try {
    const { organizationId } = req.user;
    const { employeeId } = req.params;
    const year = Number(req.query.year) || new Date().getFullYear();

    const balances = await LeaveBalance.find({
      organizationId,
      employeeId,
      year
    }).populate("leaveTypeId");

    return res.json({
      success: true,
      data: balances
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

/**
 * =========================================================
 * SYSTEM FUNCTION (INTERNAL)
 * CREATE LEAVE BALANCE ON ONBOARDING / YEAR ROLLOVER
 * PAID LEAVES ONLY
 * =========================================================
 */
export const createLeaveBalance = async ({
  organizationId,
  employeeId,
  leaveTypeId,
  year,
  allocated,
  createdBy
}) => {
  const leaveType = await LeaveType.findOne({
    _id: leaveTypeId,
    organizationId,
    isActive: true
  });

  if (!leaveType) {
    throw new Error("Invalid leave type");
  }

  // ❌ NEVER create balance for unpaid leave
  if (!leaveType.isPaid) return null;

  return LeaveBalance.create({
    organizationId,
    employeeId,
    leaveTypeId,
    isPaid: leaveType.isPaid,
    year,
    totalAllocated: allocated,
    used: 0,
    remaining: allocated,
    lastAdjustedBy: createdBy,
    adjustmentReason: "Initial allocation"
  });
};

/**
 * =========================================================
 * SYSTEM FUNCTION (INTERNAL)
 * DEDUCT BALANCE ON LEAVE APPROVAL
 * =========================================================
 */
export const deductLeaveBalance = async ({
  organizationId,
  employeeId,
  leaveTypeId,
  year,
  days,
  approvedBy
}) => {
  const balance = await LeaveBalance.findOne({
    organizationId,
    employeeId,
    leaveTypeId,
    year,
    isActive: true
  });

  if (!balance) {
    throw new Error("Leave balance not found");
  }

  // Unpaid leave → no balance logic
  if (!balance.isPaid) return null;

  if (balance.remaining < days) {
    throw new Error("Insufficient leave balance");
  }

  balance.used += days;
  balance.lastAdjustedBy = approvedBy;
  balance.adjustmentReason = "Leave approved";

  await balance.save();
  return balance;
};

/**
 * =========================================================
 * HR / ADMIN: MANUAL LEAVE BALANCE ADJUSTMENT
 * =========================================================
 */
export const adjustLeaveBalance = async (req, res) => {
  try {
    const { organizationId, employeeId: hrId } = req.user;
    const {
      balanceId,
      totalAllocated,
      adjustmentReason
    } = req.body;

    if (!adjustmentReason) {
      return res.status(400).json({
        success: false,
        message: "Adjustment reason is mandatory"
      });
    }

    const balance = await LeaveBalance.findOne({
      _id: balanceId,
      organizationId,
      isActive: true
    });

    if (!balance) {
      return res.status(404).json({
        success: false,
        message: "Leave balance not found"
      });
    }

    if (!balance.isPaid) {
      return res.status(400).json({
        success: false,
        message: "Unpaid leave does not support balance adjustment"
      });
    }

    balance.totalAllocated = totalAllocated;
    balance.lastAdjustedBy = hrId;
    balance.adjustmentReason = adjustmentReason;

    await balance.save();

    return res.json({
      success: true,
      message: "Leave balance adjusted successfully",
      data: balance
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

/**
 * =========================================================
 * HR / SYSTEM: DEACTIVATE LEAVE BALANCE (EMPLOYEE EXIT)
 * =========================================================
 */
export const deactivateLeaveBalance = async (req, res) => {
  try {
    const { organizationId } = req.user;
    const { balanceId } = req.params;

    const balance = await LeaveBalance.findOneAndUpdate(
      { _id: balanceId, organizationId },
      { isActive: false },
      { new: true }
    );

    if (!balance) {
      return res.status(404).json({
        success: false,
        message: "Leave balance not found"
      });
    }

    return res.json({
      success: true,
      message: "Leave balance deactivated",
      data: balance
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};
