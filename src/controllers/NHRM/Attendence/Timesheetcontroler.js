import Timesheet from "../../../models/NHRM/TimeAndAttendence/timesheetSubmission.js";

// ==================== Timesheet Controller ====================
export const TimesheetController = {

  // GET timesheet by employee and optional period
  async getTimesheetByEmployee(req, res) {
    try {
      const { employeeId, periodStart, periodEnd } = req.query;

      if (!employeeId) {
        return res.status(400).json({ message: 'employeeId is required' });
      }

      // Build query
      const query = { employee: employeeId };
      if (periodStart && periodEnd) {
        query.periodStart = { $gte: new Date(periodStart) };
        query.periodEnd = { $lte: new Date(periodEnd) };
      }

      const timesheets = await Timesheet.find(query)
        .populate('employee', 'firstName lastName employeeId') // optional
        .sort({ periodStart: -1 });

      return res.status(200).json({ success: true, data: timesheets });
    } catch (error) {
      console.error('Error fetching timesheets:', error);
      return res.status(500).json({ success: false, message: 'Server Error' });
    }
  },

};
