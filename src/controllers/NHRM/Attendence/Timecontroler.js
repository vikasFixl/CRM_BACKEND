// Get time logs for an employee
import TimeTracking from "../../../models/NHRM/TimeAndAttendence/timeTracking.js";
export const getTimeLogs = async (req, res) => {
  try {
    const { employeeId, startDate, endDate, status, shiftType } = req.query;

    const query = { employee: employeeId };

    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    if (status) query.status = status;
    if (shiftType) query.shiftType = shiftType;

    const timeLogs = await TimeTracking.find(query).sort({ date: 1 });

    res.status(200).json({ timeLogs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};