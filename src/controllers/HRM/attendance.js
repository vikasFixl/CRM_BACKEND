const { getPagination } = require("../../utils/query");
const moment = require("moment");

const Attendance = require("../../models/HRM/attendance"); // Adjust the path to your Mongoose Attendance model
const Employee = require("../../models/HRM/employee");
const Shift = require("../../models/HRM/shift"); // Adjust the path to your Mongoose User model

const createAttendance = async (req, res) => {
  try {
    const id = req.body.userId;
    // Check authorization to create attendance
    // if (!(id === req.auth.sub) && !req.auth.permissions.includes("create-attendance")) {
    //   return res.status(401).json({
    //     message: "Unauthorized. You are not authorized to give attendance",
    //   });
    // }

    // Get user's shift
    const user = await Employee.findById(req.body.userId);
    // .populate("shift");
    const shift = await Shift.findById(user.shiftId);
    console.log("id", user, id, shift);

    // Format time
    const startTime = moment(shift.startTime, "h:mm A");
    const endTime = moment(shift.endTime, "h:mm A");

    // Check if user is late or early
    const isLate = moment().isAfter(startTime);
    const isEarly = moment().isBefore(startTime);
    const isOutEarly = moment().isAfter(endTime);
    const isOutLate = moment().isBefore(endTime);

    // Find existing attendance record with no outTime
    const attendance = await Attendance.findOne({
      userId: id,
      outTime: null,
    });

    if (req.query.query === "manualPunch") {
      const inTime = new Date(req.body.inTime);
      const outTime = new Date(req.body.outTime);
      const totalHours = Math.abs(outTime - inTime) / 36e5;

      const newAttendance = new Attendance({
        userId: id,
        inTime: inTime,
        outTime: outTime,
        punchBy: req.body.punchBy,
        inTimeStatus: req.body.inTimeStatus ? req.body.inTimeStatus : null,
        outTimeStatus: req.body.outTimeStatus ? req.body.outTimeStatus : null,
        comment: req.body.comment ? req.body.comment : null,
        ip: req.body.ip ? req.body.ip : null,
        totalHour: parseFloat(totalHours.toFixed(3)),
      });

      await newAttendance.save();
      return res.status(201).json(newAttendance);
    } else if (!attendance) {
      const inTime = new Date(moment.now());

      const newAttendance = new Attendance({
        userId: id,
        inTime: inTime,
        outTime: null,
        punchBy: req.body.punchBy,
        comment: req.body.comment ? req.body.comment : null,
        ip: req.body.ip ? req.body.ip : null,
        inTimeStatus: isEarly ? "Early" : isLate ? "Late" : "On Time",
        outTimeStatus: null,
      });

      await newAttendance.save();
      return res.status(201).json(newAttendance);
    } else {
      const outTime = new Date(moment.now());
      const totalHours = Math.abs(outTime - attendance.inTime) / 36e5;

      attendance.outTime = outTime;
      attendance.totalHour = parseFloat(totalHours.toFixed(3));
      attendance.outTimeStatus = isOutEarly
        ? "Early"
        : isOutLate
        ? "Late"
        : "On Time";
      await attendance.save();
      return res.status(200).json(attendance);
    }
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const getAllAttendance = async (req, res) => {
  // if (!req.auth.permissions.includes("readAll-attendance")) {
  //   return res.status(401).json({ message: "You are not able to access this route" });
  // }

  if (req.query.query === "all") {
    try {
      const allAttendance = await Attendance.find()
        .sort({ id: "asc" })
        .populate("user", "firstName lastName");
      const punchBy = await Employee.find(
        { _id: { $in: allAttendance.map((item) => item.punchBy) } },
        "id firstName lastName"
      );

      const result = allAttendance.map((attendance) => ({
        ...attendance.toObject(),
        punchBy,
      }));

      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  } else {
    const { skip, limit } = getPagination(req.query);
    try {
      const startDate = new Date(req.query.startdate);
      const endDate = new Date(req.query.enddate);
      const allAttendance = await Attendance.find({
        inTime: { $gte: startDate, $lte: endDate },
      })
        .sort({ id: "asc" })
        .skip(Number(skip))
        .limit(Number(limit));
      // .populate("user", "firstName lastName");
      console.log("dkdkdkd", allAttendance);
      const punchBy = await Employee.find(
        { _id: { $in: allAttendance.map((item) => item.punchBy) } },
        "id firstName lastName"
      );
      const result = allAttendance.map((attendance) => ({
        ...attendance.toObject(),
        punchBy,
      }));
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }
};

const getSingleAttendance = async (req, res) => {
  try {
    const attendanceId = req.params.id;
    const singleAttendance = await Attendance.findById(attendanceId);
    // .populate(
    //   "userId",
    //   "id firstName lastName email"
    // );
    console.log("fkkf", attendanceId, singleAttendance);
    if (!singleAttendance) {
      return res.status(404).json({ message: "Attendance record not found" });
    }

    const punchBy = await Employee.findById(
      singleAttendance.punchBy,
      "firstName lastName"
    );

    // Check permissions for access
    // if (
    //   (req.auth.sub !== singleAttendance.user.id &&
    //     !req.auth.permissions.includes("readAll-attendance")) ||
    //   !req.auth.permissions.includes("readSingle-attendance")
    // ) {
    //   return res.status(401).json({ message: "Unauthorized" });
    // }

    const result = {
      ...singleAttendance.toObject(),
      punchBy,
    };

    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const getAttendanceByUserId = async (req, res) => {
  try {
    const userId = req.params.id;
    const allAttendance = await Attendance.find({ userId: userId });
    // .sort({ id: "asc" })
    // .populate("user", "firstName lastName");
    console.log("allAttendance", allAttendance);
    const punchByUserIds = allAttendance.map((item) => item.punchBy);
    console.log("punchByUserIds", punchByUserIds);
    const uniqueUserIds = [...new Set(punchByUserIds)];

    // Find users based on uniqueUserIds
    const punchByUsers = await User.find({ _id: { $in: uniqueUserIds } });
    // const punchByUsers = await User.find(
    //   { _id: { $in: punchByUserIds } },
    // );
    console.log("punchByUsers", punchByUsers);

    const result = allAttendance.map((attendance) => {
      const punchBy = punchByUsers.find(
        (user) => user.id.toString() === attendance.punchBy.toString()
      );
      return {
        ...attendance.toObject(),
        punchBy,
      };
    });

    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// get the last attendance of a user
const getLastAttendanceByUserId = async (req, res) => {
  try {
    const userId = req.params.id;
    const lastAttendance = await Attendance.findOne({ userId }).sort({
      id: "desc",
    });

    return res.status(200).json(lastAttendance);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createAttendance,
  getAllAttendance,
  getSingleAttendance,
  getAttendanceByUserId,
  getLastAttendanceByUserId,
};
