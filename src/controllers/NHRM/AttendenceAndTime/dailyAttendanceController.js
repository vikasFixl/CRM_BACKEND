import DailyAttendance from "../models/DailyAttendance.js";

/**
 * SYSTEM: CREATE OR UPDATE DAILY ATTENDANCE
 * (called by attendance calculation engine)
 */
export const upsertDailyAttendance = async ({
  organizationId,
  employeeId,
  date,
  data
}) => {
  const record = await DailyAttendance.findOne({
    organizationId,
    employeeId,
    date
  });

  if (record && record.isLocked) {
    return record; // do nothing if locked
  }

  return DailyAttendance.findOneAndUpdate(
    { organizationId, employeeId, date },
    {
      organizationId,
      employeeId,
      date,
      ...data
    },
    {
      upsert: true,
      new: true
    }
  );
};

export const getEmployeeDailyAttendance = async (req, res) => {
  try {
    const { organizationId } = req.user;
    const { employeeId } = req.params;
    const { from, to } = req.query;

    const query = {
      organizationId,
      employeeId
    };

    if (from && to) {
      query.date = {
        $gte: new Date(from),
        $lte: new Date(to)
      };
    }

    const records = await DailyAttendance.find(query)
      .sort({ date: 1 });

    res.json({ success: true, data: records });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const lockAttendance = async (req, res) => {
  try {
    const { organizationId, employeeId: hrId } = req.user;
    const { from, to } = req.body;

    const result = await DailyAttendance.updateMany(
      {
        organizationId,
        date: {
          $gte: new Date(from),
          $lte: new Date(to)
        }
      },
      {
        isLocked: true,
        lockedAt: new Date(),
        lockedBy: hrId
      }
    );

    res.json({
      success: true,
      message: "Attendance locked",
      modified: result.modifiedCount
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
