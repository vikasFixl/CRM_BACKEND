import EmployeeShiftAssignment from "../../../models/NHRM/TimeAndAttendence/EmployeeShiftAssignment.js";
import ShiftMaster from "../../../models/NHRM/TimeAndAttendence/ShiftMaster.js";
import { asyncWrapper } from "../../../middleweare/middleware.js";
import { AppError } from "../../../middleweare/errorhandler.js";

/**
 * ASSIGN OR CHANGE SHIFT
 * HR / ADMIN only
 */
export const assignShift = asyncWrapper(async (req, res) => {
  const { orgId: organizationId } = req.user.hrm;
  const { employeeId, shiftId, effectiveFrom, locationId } = req.body;

  if (!employeeId || !shiftId) {
    throw new AppError("employeeId and shiftId are required", 400);
  }

  const startDate = effectiveFrom
    ? new Date(effectiveFrom)
    : new Date();

  /* 1️⃣ Validate shift */
  const shift = await ShiftMaster.findOne({
    _id: shiftId,
    organizationId,
    isActive: true
  });

  if (!shift) {
    throw new AppError("Invalid or inactive shift", 400);
  }

  /* 2️⃣ Close existing active assignment */
  await EmployeeShiftAssignment.findOneAndUpdate(
    {
      organizationId,
      employeeId,
      isActive: true,
      effectiveTo: null
    },
    {
      isActive: false,
      effectiveTo: new Date(startDate.getTime() - 1)
    }
  );

  /* 3️⃣ Create new assignment */
  const assignment = await EmployeeShiftAssignment.create({
    organizationId,
    employeeId,
    shiftId,
    effectiveFrom: startDate,
    effectiveTo: null,
    isActive: true,
    locationId
  });

  res.status(201).json({
    success: true,
    message: "Shift assigned successfully",
    data: assignment
  });
});


/**
 * GET CURRENT ACTIVE SHIFT FOR AN EMPLOYEE
 */export const getCurrentShift = asyncWrapper(async (req, res) => {
  const { orgId: organizationId } = req.user.hrm;
  const { employeeId } = req.params;

  const assignment = await EmployeeShiftAssignment.findOne({
    organizationId,
    employeeId,
    isActive: true,
    effectiveTo: null
  }).populate("shiftId");

  if (!assignment) {
    throw new AppError("No active shift found for employee", 404);
  }

  res.status(200).json({
    success: true,
    data: assignment,
    message:"Shift fetched successfully"
  });
});

export const disableShiftAssignment = asyncWrapper(async (req, res) => {
  const { orgId: organizationId } = req.user.hrm;
  const { assignmentId } = req.params;

  const assignment = await EmployeeShiftAssignment.findOneAndUpdate(
    {
      _id: assignmentId,
      organizationId,
      isActive: true
    },
    {
      isActive: false,
      effectiveTo: new Date()
    },
    { new: true }
  );

  if (!assignment) {
    throw new AppError("Active shift assignment not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "Shift assignment disabled",
    data: assignment
  });
});
export const getShiftHistory = asyncWrapper(async (req, res) => {
  const { orgId: organizationId } = req.user.hrm;
  const { employeeId } = req.params;

  const history = await EmployeeShiftAssignment.find({
    organizationId,
    employeeId
  })
    .populate("shiftId")
    .sort({ effectiveFrom: -1 });

  res.status(200).json({
    message: "Shift assignment history fetched successfully",
    success: true,
    data: history
  });
});
