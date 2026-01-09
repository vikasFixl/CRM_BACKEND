import LeaveBalance from "../../../models/NHRM/TimeAndAttendence/LeaveBalance.js";
import LeaveType from "../../../models/NHRM/TimeAndAttendence/LeaveType.js";

export const initializeLeaveBalanceForEmployee = async ({
  organizationId,
  employeeId,
  joinDate,
  session
}) => {
  const year = new Date(joinDate).getFullYear();

  // Get all active PAID leave types
  const leaveTypes = await LeaveType.find(
    { organizationId, isActive: true, isPaid: true },
    null,
    { session }
  );

  const balances = leaveTypes.map((lt) => ({
    organizationId,
    employeeId,
    leaveTypeId: lt._id,
    isPaid: true,
    year,
    totalAllocated: lt.annualAllocation,
    used: 0,
    remaining: lt.annualAllocation,
    accruedTillMonth: new Date(joinDate).getMonth() + 1
  }));

  if (balances.length) {
    await LeaveBalance.insertMany(balances, { session });
  }
};

export const createLeaveBalanceForNewLeaveType = async ({
  organizationId,
  leaveType,
  session
}) => {
  if (!leaveType.isPaid) return;

  const year = new Date().getFullYear();

  const employees = await EmployeeProfile.find(
    { organizationId, "jobInfo.status": "Active" },
    "_id",
    { session }
  );

  const balances = employees.map((emp) => ({
    organizationId,
    employeeId: emp._id,
    leaveTypeId: leaveType._id,
    isPaid: true,
    year,
    totalAllocated: leaveType.annualAllocation,
    used: 0,
    remaining: leaveType.annualAllocation
  }));

  await LeaveBalance.insertMany(balances, { session });
};



export const getMyLeaveBalance = async (req, res) => {
  try {
    const { organizationId, employeeId } = req.user;
    const year = Number(req.query.year) || new Date().getFullYear();

    const balances = await LeaveBalance.find({
      organizationId,
      employeeId,
      year,
      isActive: true
    }).populate("leaveTypeId");

    res.json({ success: true, data: balances });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getEmployeeLeaveBalance = async (req, res) => {
  try {
    const organizationId = req.orgUser.orgId;
    const { employeeId } = req.params;
    const year = Number(req.query.year) || new Date().getFullYear();

    const balances = await LeaveBalance.find({
      organizationId,
      employeeId,
      year
    }).populate("leaveTypeId");

    res.json({ success: true, data: balances });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
