import RawTimeLog from "../models/RawTimeLog.js";

/**
 * EMPLOYEE PUNCH IN
 */
export const punchIn = async (req, res) => {
  try {
    const { organizationId, employeeId } = req.user;
    const { source, deviceId } = req.body;

    // Get last punch
    const lastLog = await RawTimeLog.findOne({
      organizationId,
      employeeId
    }).sort({ timestamp: -1 });

    if (lastLog && lastLog.punchType === "IN") {
      return res.status(400).json({
        success: false,
        message: "Already punched in"
      });
    }

    const log = await RawTimeLog.create({
      organizationId,
      employeeId,
      punchType: "IN",
      timestamp: new Date(),
      source,
      deviceId,
      ipAddress: req.ip,
      isManual: source === "admin"
    });

    res.status(201).json({
      success: true,
      message: "Punch in recorded",
      data: log
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

/**
 * EMPLOYEE PUNCH OUT
 */
export const punchOut = async (req, res) => {
  try {
    const { organizationId, employeeId } = req.user;
    const { source, deviceId } = req.body;

    const lastLog = await RawTimeLog.findOne({
      organizationId,
      employeeId
    }).sort({ timestamp: -1 });

    if (!lastLog || lastLog.punchType !== "IN") {
      return res.status(400).json({
        success: false,
        message: "Punch in required before punch out"
      });
    }

    const log = await RawTimeLog.create({
      organizationId,
      employeeId,
      punchType: "OUT",
      timestamp: new Date(),
      source,
      deviceId,
      ipAddress: req.ip,
      isManual: source === "admin"
    });

    res.status(201).json({
      success: true,
      message: "Punch out recorded",
      data: log
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

/**
 * GET TODAY'S RAW LOGS
 */
export const getTodayPunches = async (req, res) => {
  try {
    const { organizationId, employeeId } = req.user;

    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const logs = await RawTimeLog.find({
      organizationId,
      employeeId,
      timestamp: { $gte: start, $lte: end }
    }).sort({ timestamp: 1 });

    res.json({
      success: true,
      data: logs
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

/**
 * HR / ADMIN: GET EMPLOYEE RAW LOGS
 */
export const getEmployeeRawLogs = async (req, res) => {
  try {
    const { organizationId } = req.user;
    const { employeeId } = req.params;
    const { from, to } = req.query;

    const query = {
      organizationId,
      employeeId
    };

    if (from && to) {
      query.timestamp = {
        $gte: new Date(from),
        $lte: new Date(to)
      };
    }

    const logs = await RawTimeLog.find(query).sort({ timestamp: 1 });

    res.json({
      success: true,
      data: logs
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

export const punchOut = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const { organizationId, employeeId } = req.user;
    const { source = "web", deviceId } = req.body;

    const lastLog = await getLastPunch(organizationId, employeeId, session);

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
        punchType: "OUT",
        timestamp: new Date(),
        source,
        deviceId,
        ipAddress: req.ip,
        isManual: req.user.role === "HR" || req.user.role === "ADMIN"
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
      .limit(1000); // safety

    res.json({ success: true, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
