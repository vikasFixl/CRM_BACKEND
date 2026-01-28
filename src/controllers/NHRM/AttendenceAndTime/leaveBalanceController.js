import { asyncWrapper } from "../../../middleweare/middleware.js";
import { EmployeeProfile } from "../../../models/NHRM/employeeManagement/employeeProfile.js";
import LeaveBalance from "../../../models/NHRM/TimeAndAttendence/LeaveBalance.js";
import LeaveType from "../../../models/NHRM/TimeAndAttendence/LeaveType.js";
export const initializeLeaveBalanceForEmployee = async ({
  organizationId,
  employeeId,
  joinDate,
  session
}) => {
  const year = new Date(joinDate).getFullYear();

  const leaveTypes = await LeaveType.find(
    { organizationId, isActive: true, isPaid: true },
    null,
    { session }
  );

  const balances = leaveTypes.map((lt) => ({
    organizationId,
    employeeId,
    leaveTypeId: lt._id,
    year,
    totalAllocated: lt.annualAllocation,
    used: 0,
    remaining: lt.annualAllocation,
    accruedTillMonth: lt.accrualType === "MONTHLY"
      ? new Date(joinDate).getMonth() + 1
      : 12
  }));

  if (balances.length) {
    await LeaveBalance.insertMany(balances, { session });
  }

  return res.status(200).json({ message: "Leave balances initialized", success: true });
};


export const createLeaveBalanceForNewLeaveType = async ({
  organizationId,
  leaveType,
  session
}) => {
  if (!leaveType.isPaid) return;

  const year = new Date().getFullYear();

  const employees = await EmployeeProfile.find(
    { organizationId, isActive: true },
    "_id",
    { session }
  );

  const balances = employees.map((emp) => ({
    organizationId,
    employeeId: emp._id,
    leaveTypeId: leaveType._id,
    year,
    totalAllocated: leaveType.annualAllocation,
    used: 0,
    remaining: leaveType.annualAllocation
  }));

  if (balances.length) {
    await LeaveBalance.insertMany(balances, { session });
  }
};
export const getMyLeaveBalance = asyncWrapper(async (req, res) => {
  const { orgId: organizationId, sub: employeeId } = req.user.hrm;
  const year = Number(req.query.year) || new Date().getFullYear();

  const balances = await LeaveBalance.find({
    organizationId,
    employeeId,
    year,
    isActive: true
  }).populate("leaveTypeId");

  res.status(200).json({ message: "Leave Balance fetched", success: true, data: balances });
});


export const getEmployeeLeaveBalance = asyncWrapper(async (req, res) => {
  const { orgId: organizationId, role } = req.user.hrm;
  const { employeeId } = req.params;
  const year = Number(req.query.year) || new Date().getFullYear();

  const balances = await LeaveBalance.find({
    organizationId,
    employeeId,
    year
  }).populate("leaveTypeId");

  res.status(200).json({ success: true, data: balances });
});
