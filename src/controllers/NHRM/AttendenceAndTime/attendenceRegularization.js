import mongoose from "mongoose";
import { asyncWrapper } from "../../../middleweare/middleware.js";
import { AppError } from "../../../middleweare/errorhandler.js";

import AttendanceRegularization from "../../../models/NHRM/TimeAndAttendence/AttendanceRegularization.js";
import { HrmAuditLog } from "../../../models/NHRM/logs/HrmLogs.js";

export const requestRegularization = asyncWrapper(async (req, res) => {
  const { orgId: organizationId, sub: employeeId, role } = req.user.hrm;
  const { attendanceDate, requestedIn, requestedOut, reason } = req.body;

  if (!attendanceDate || !reason) {
    throw new AppError("attendanceDate and reason are required", 400);
  }

  const date = new Date(attendanceDate);
  date.setUTCHours(0, 0, 0, 0);

  const diffDays = Math.floor(
    (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24)
  );

  let request;
  try {
    request = await AttendanceRegularization.create({
      organizationId,
      employeeId,
      attendanceDate: date,
      requestedIn,
      requestedOut,
      reason,
      isBackdated: diffDays > 0,
      backdatedDays: Math.max(diffDays, 0)
    });
  } catch (err) {
    if (err.code === 11000) {
      throw new AppError(
        "Regularization already requested for this date",
        409
      );
    }
    throw err;
  }

  await HrmAuditLog.create({
    organizationId,
    actorId: employeeId,
    actorRole: role,
    entityType: "Attendance",
    entityId: request._id,
    action: "CREATE",
    message: `Attendance regularization requested for ${date.toDateString()}`,
    after: request.toObject(),
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"]
  });

  res.status(201).json({
    success: true,
    message: "Regularization request submitted",
    data: request
  });
});
export const approveRegularization = asyncWrapper(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { orgId: organizationId, sub: approverId, role } = req.user.hrm;
    const { id } = req.params;

    const reg = await AttendanceRegularization.findOne(
      { _id: id, organizationId, status: "Pending" },
      null,
      { session }
    );

    if (!reg) {
      throw new AppError(
        "Regularization request not found or already processed",
        404
      );
    }

    /** 1️⃣ Create manual punches */
    if (reg.requestedIn) {
      await RawTimeLog.create(
        [{
          organizationId,
          employeeId: reg.employeeId,
          timestamp: reg.requestedIn,
          punchType: "IN",
          source: "admin",
          isManual: true
        }],
        { session }
      );
    }

    if (reg.requestedOut) {
      await RawTimeLog.create(
        [{
          organizationId,
          employeeId: reg.employeeId,
          timestamp: reg.requestedOut,
          punchType: "OUT",
          source: "admin",
          isManual: true
        }],
        { session }
      );
    }

    /** 2️⃣ Mark attendance recalculable */
    await DailyAttendance.findOneAndUpdate(
      {
        organizationId,
        employeeId: reg.employeeId,
        attendanceDate: reg.attendanceDate,
        isLocked: false
      },
      { source: "regularized" },
      { session }
    );

    /** 3️⃣ Approve request */
    reg.status = "Approved";
    reg.approvedBy = approverId;
    reg.approvedAt = new Date();
    await reg.save({ session });

    await session.commitTransaction();

    await HrmAuditLog.create({
      organizationId,
      actorId: approverId,
      actorRole: role,
      entityType: "Attendance",
      entityId: reg._id,
      action: "APPROVE",
      message: `Attendance regularization approved for ${reg.attendanceDate.toDateString()}`,
      before: { status: "Pending" },
      after: { status: "Approved" },
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });

    res.json({
      success: true,
      message: "Regularization approved and attendance recalculated"
    });

  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
});

export const rejectRegularization = asyncWrapper(async (req, res) => {
  const { orgId: organizationId, sub: approverId, role } = req.user.hrm;
  const { id } = req.params;
  const { remarks } = req.body;

  const reg = await AttendanceRegularization.findOneAndUpdate(
    { _id: id, organizationId, status: "Pending" },
    {
      status: "Rejected",
      approvedBy: approverId,
      approvedAt: new Date(),
      remarks
    },
    { new: true }
  );

  if (!reg) {
    throw new AppError(
      "Request not found or already processed",
      404
    );
  }

  await HrmAuditLog.create({
    organizationId,
    actorId: approverId,
    actorRole: role,
    entityType: "Attendance",
    entityId: reg._id,
    action: "REJECT",
    message: `Attendance regularization rejected for ${reg.attendanceDate.toDateString()}`,
    before: { status: "Pending" },
    after: { status: "Rejected" },
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"]
  });

  res.json({
    success: true,
    message: "Regularization rejected",
    data: reg
  });
});

