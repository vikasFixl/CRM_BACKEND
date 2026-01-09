import RawTimeLog from "../../../models/NHRM/TimeAndAttendence/RawTimeLog.js";
import DailyAttendance from "../../../models/NHRM/TimeAndAttendence/DailyAttendance.js";
import AttendanceRegularization from "../../../models/NHRM/TimeAndAttendence/AttendanceRegularization.js";

export const requestRegularization = async (req, res) => {
  try {
    const { organizationId, employeeId } = req.user;
    const { attendanceDate, requestedIn, requestedOut, reason } = req.body;

    if (!attendanceDate || !reason) {
      return res.status(400).json({
        success: false,
        message: "attendanceDate and reason are required"
      });
    }

    const date = new Date(attendanceDate);
    date.setUTCHours(0, 0, 0, 0);

    const diffDays =
      Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));

    const request = await AttendanceRegularization.create({
      organizationId,
      employeeId,
      attendanceDate: date,
      requestedIn,
      requestedOut,
      reason,
      isBackdated: diffDays > 0,
      backdatedDays: Math.max(diffDays, 0)
    });

    res.status(201).json({
      success: true,
      message: "Regularization request submitted",
      data: request
    });

  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Regularization already requested for this date"
      });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};


export const approveRegularization = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const organizationId = req.orgUser.orgId;
    const approverId = req.user.userId;
    const { id } = req.params;

    const reg = await AttendanceRegularization.findOne(
      { _id: id, organizationId, status: "Pending" },
      null,
      { session }
    );

    if (!reg) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "Regularization request not found or already processed"
      });
    }

    /** 1️⃣ Create manual RawTimeLogs */
    if (reg.requestedIn) {
      await RawTimeLog.create([{
        organizationId,
        employeeId: reg.employeeId,
        timestamp: reg.requestedIn,
        punchType: "IN",
        source: "admin",
        isManual: true
      }], { session });
    }

    if (reg.requestedOut) {
      await RawTimeLog.create([{
        organizationId,
        employeeId: reg.employeeId,
        timestamp: reg.requestedOut,
        punchType: "OUT",
        source: "admin",
        isManual: true
      }], { session });
    }

    /** 2️⃣ Mark existing attendance as recalculable */
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

    res.json({
      success: true,
      message: "Regularization approved and attendance recalculated"
    });

  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ success: false, message: err.message });
  } finally {
    session.endSession();
  }
};

export const rejectRegularization = async (req, res) => {
  try {
    const organizationId = req.orgUser.orgId;
    const { id } = req.params;
    const { remarks } = req.body;

    const reg = await AttendanceRegularization.findOneAndUpdate(
      { _id: id, organizationId, status: "Pending" },
      {
        status: "Rejected",
        approvedBy: req.user.userId,
        approvedAt: new Date(),
        remarks
      },
      { new: true }
    );

    if (!reg) {
      return res.status(404).json({
        success: false,
        message: "Request not found or already processed"
      });
    }

    res.json({
      success: true,
      message: "Regularization rejected",
      data: reg
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
