import mongoose from "mongoose";
import RawTimeLog from "../../../models/NHRM/TimeAndAttendence/RawTimeLog.js";

export const punchIn = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const { organizationId, employeeId, role } = req.user;
    const { source = "web", deviceId } = req.body;

    const lastLog = await RawTimeLog.findOne(
      { organizationId, employeeId },
      null,
      { session }
    ).sort({ timestamp: -1 });

    if (lastLog?.punchType === "IN") {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Already punched in"
      });
    }

    const log = await RawTimeLog.create(
      [{
        organizationId,
        employeeId,
        timestamp: new Date(),
        punchType: "IN",
        source,
        deviceId,
        ipAddress: req.ip,
        isManual: role === "HR" || role === "ADMIN"
      }],
      { session }
    );

    await session.commitTransaction();

    res.status(201).json({
      success: true,
      message: "Punch in recorded",
      data: log[0]
    });

  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ success: false, message: err.message });
  } finally {
    session.endSession();
  }
};

export const punchOut = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const { organizationId, employeeId, role } = req.user;
    const { source = "web", deviceId } = req.body;

    const lastLog = await RawTimeLog.findOne(
      { organizationId, employeeId },
      null,
      { session }
    ).sort({ timestamp: -1 });

    if (!lastLog || lastLog.punchType !== "IN") {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Punch in required before punch out"
      });
    }

    const log = await RawTimeLog.create(
      [{
        organizationId,
        employeeId,
        timestamp: new Date(),
        punchType: "OUT",
        source,
        deviceId,
        ipAddress: req.ip,
        isManual: role === "HR" || role === "ADMIN"
      }],
      { session }
    );

    await session.commitTransaction();

    res.status(201).json({
      success: true,
      message: "Punch out recorded",
      data: log[0]
    });

  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ success: false, message: err.message });
  } finally {
    session.endSession();
  }
};



export const getTodayPunches = async (req, res) => {
  try {
    const { organizationId, employeeId } = req.user;

    const start = new Date();
    start.setUTCHours(0, 0, 0, 0);

    const end = new Date();
    end.setUTCHours(23, 59, 59, 999);

    const logs = await RawTimeLog.find({
      organizationId,
      employeeId,
      timestamp: { $gte: start, $lte: end }
    }).sort({ timestamp: 1 });

    res.json({ success: true, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
export const getEmployeeRawLogs = async (req, res) => {
  try {
    const { organizationId } = req.user;
    const { employeeId } = req.params;
    const { from, to } = req.query;

    const query = { organizationId, employeeId };

    if (from && to) {
      query.timestamp = {
        $gte: new Date(from),
        $lte: new Date(to)
      };
    }

    const logs = await RawTimeLog.find(query)
      .sort({ timestamp: 1 })
      .limit(1000);

    res.json({ success: true, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
