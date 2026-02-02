import AttendancePolicy from "../../../models/NHRM/TimeAndAttendence/AttendancePolicy.js";
import { asyncWrapper } from "../../../middleweare/middleware.js";
import { AppError } from "../../../middleweare/errorhandler.js";

/**
 * CREATE / UPDATE POLICY
 * (Deactivates previous policy automatically)
 */
export const upsertPolicy = asyncWrapper(async (req, res) => {
  const { orgId: organizationId } = req.user.hrm;

  // Deactivate existing active policies
  await AttendancePolicy.updateMany(
    { organizationId, isActive: true },
    { isActive: false }
  );

  const policy = await AttendancePolicy.create({
    organizationId,
    ...req.body,
    isActive: true
  });

  res.status(201).json({
    success: true,
    message: "Attendance policy created successfully",
    data: policy
  });
});

/**
 * GET ACTIVE POLICY
 */
export const getActivePolicy = asyncWrapper(async (req, res) => {
  const { orgId: organizationId } = req.user.hrm;

  const policy = await AttendancePolicy.findOne({
    organizationId,
    isActive: true
  });

  if (!policy) {
    throw new AppError("Attendance policy not configured", 404);
  }

  res.status(200).json({
    success: true,
    data: policy
  });
});
