import MonthlyAttendanceSummary from "../../../models/NHRM/TimeAndAttendence/MonthlyAttendanceSummary.js";
import DailyAttendance from "../../../models/NHRM/TimeAndAttendence/DailyAttendance.js";

export const calculateMonthlyAttendance = async ({
  organizationId,
  employeeId,
  year,
  month,
  session
}) => {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);

  const daily = await DailyAttendance.find(
    {
      organizationId,
      employeeId,
      attendanceDate: { $gte: start, $lte: end }
    },
    null,
    { session }
  );

  const totalCalendarDays = end.getDate();

  let summary = {
    presentDays: 0,
    absentDays: 0,
    leaveDays: 0,
    paidLeaveDays: 0,
    unpaidLeaveDays: 0,
    holidays: 0,
    weekendDays: 0,
    overtimeMinutes: 0
  };

  for (const d of daily) {
    summary.overtimeMinutes += d.overtimeMinutes || 0;

    switch (d.status) {
      case "Present":
        summary.presentDays++;
        break;
      case "Absent":
        summary.absentDays++;
        break;
      case "Leave":
        summary.leaveDays++;
        if (d.source === "system" || d.source === "regularized") {
          summary.paidLeaveDays++;
        } else {
          summary.unpaidLeaveDays++;
        }
        break;
      case "Holiday":
        summary.holidays++;
        break;
      case "Weekend":
        summary.weekendDays++;
        break;
    }
  }

  const totalWorkingDays =
    totalCalendarDays - summary.holidays - summary.weekendDays;

  const payableDays =
    summary.presentDays +
    summary.paidLeaveDays +
    summary.holidays +
    summary.weekendDays;

  await MonthlyAttendanceSummary.findOneAndUpdate(
    { organizationId, employeeId, year, month },
    {
      organizationId,
      employeeId,
      year,
      month,
      totalCalendarDays,
      totalWorkingDays,
      ...summary,
      payableDays
    },
    { upsert: true, new: true, session }
  );
};

export const getEmployeeMonthlySummary = async (req, res) => {
  try {
    const organizationId = req.orgUser.orgId;
    const { employeeId } = req.params;
    const { year, month } = req.query;

    const summary = await MonthlyAttendanceSummary.findOne({
      organizationId,
      employeeId,
      year,
      month
    });

    if (!summary) {
      return res.status(404).json({
        success: false,
        message: "Monthly attendance not calculated yet"
      });
    }

    res.json({ success: true, data: summary });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const lockMonthlyAttendance = async (req, res) => {
  try {
    const organizationId = req.orgUser.orgId;
    const { year, month } = req.body;

    await MonthlyAttendanceSummary.updateMany(
      {
        organizationId,
        year,
        month,
        lockedForPayroll: false
      },
      {
        lockedForPayroll: true,
        lockedAt: new Date(),
        lockedBy: req.user.userId
      }
    );

    res.json({
      success: true,
      message: "Monthly attendance locked for payroll"
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const unlockMonthlyAttendance = async (req, res) => {
  try {
    const organizationId = req.orgUser.orgId;
    const { year, month, reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: "Unlock reason required"
      });
    }

    await MonthlyAttendanceSummary.updateMany(
      {
        organizationId,
        year,
        month,
        lockedForPayroll: true
      },
      { lockedForPayroll: false }
    );

    res.json({
      success: true,
      message: "Monthly attendance unlocked for correction"
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

