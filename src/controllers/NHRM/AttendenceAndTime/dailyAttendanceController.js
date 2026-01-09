import DailyAttendance from "../../../models/NHRM/TimeAndAttendence/DailyAttendance.js";

export const getMyAttendance = async (req, res) => {
  try {
    const { organizationId, employeeId } = req.user;
    const { from, to } = req.query;

    if (!from || !to) {
      return res.status(400).json({
        success: false,
        message: "from and to dates are required"
      });
    }

    const data = await DailyAttendance.find({
      organizationId,
      employeeId,
      attendanceDate: {
        $gte: new Date(from),
        $lte: new Date(to)
      }
    })
      .sort({ attendanceDate: 1 })
      .lean();

    return res.json({ success: true, data });

  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};


export const getEmployeeAttendance = async (req, res) => {
  try {
    const organizationId = req.orgUser.orgId;
    const { employeeId } = req.params;
    const { from, to } = req.query;

    if (!from || !to) {
      return res.status(400).json({
        success: false,
        message: "from and to dates are required"
      });
    }

    const data = await DailyAttendance.find({
      organizationId,
      employeeId,
      attendanceDate: {
        $gte: new Date(from),
        $lte: new Date(to)
      }
    })
      .populate("shiftAssignmentId")
      .sort({ attendanceDate: 1 });

    return res.json({ success: true, data });

  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const overrideAttendance = async (req, res) => {
  try {
    const organizationId = req.orgUser.orgId;
    const { attendanceId } = req.params;
    const { status, remarks } = req.body;

    const attendance = await DailyAttendance.findOne({
      _id: attendanceId,
      organizationId,
      isLocked: false
    });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance not found or already locked"
      });
    }

    attendance.status = status;
    attendance.source = "manual";
    attendance.remarks = remarks;

    await attendance.save();

    return res.json({
      success: true,
      message: "Attendance overridden successfully",
      data: attendance
    });

  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const lockAttendanceForPayroll = async (req, res) => {
  try {
    const organizationId = req.orgUser.orgId;
    const { from, to } = req.body;

    if (!from || !to) {
      return res.status(400).json({
        success: false,
        message: "from and to dates are required"
      });
    }

    await DailyAttendance.updateMany(
      {
        organizationId,
        attendanceDate: {
          $gte: new Date(from),
          $lte: new Date(to)
        }
      },
      {
        isLocked: true,
        lockedAt: new Date(),
        lockedBy: req.user.userId
      }
    );

    return res.json({
      success: true,
      message: "Attendance locked for payroll"
    });

  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

