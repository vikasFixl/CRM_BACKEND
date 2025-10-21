import cron from 'node-cron';
import mongoose from 'mongoose';
import TimeTracking from '../models/NHRM/TimeAndAttendence/timeTracking.js';
import { EmployeeProfile } from '../models/NHRM/employeeManagement/employeeProfile.js';
import { EmployeeProfile } from '../models/NHRM/employeeManagement/employeeProfile.js';
// Function to get start and end of last week
function getLastWeekRange() {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday
  const lastSunday = new Date(now);
  lastSunday.setDate(now.getDate() - day - 7); // last week's Sunday
  lastSunday.setHours(0, 0, 0, 0);

  const lastSaturday = new Date(lastSunday);
  lastSaturday.setDate(lastSunday.getDate() + 6);
  lastSaturday.setHours(23, 59, 59, 999);

  return { start: lastSunday, end: lastSaturday };
}

// Main function to generate timesheets
async function generateWeeklyTimesheets() {
  const { start, end } = getLastWeekRange();
  console.log(`Generating timesheets for: ${start.toDateString()} - ${end.toDateString()}`);

  const employees = await EmployeeProfile.find({}); // all employees
  for (const emp of employees) {
    // Fetch all time logs for this employee in last week
    const logs = await TimeTracking.find({
      employee: emp._id,
      date: { $gte: start, $lte: end },
    });

    if (!logs.length) continue; // skip if no logs

    // Summarize hours per day
    const dailyMap = {};
    logs.forEach(log => {
      const dayKey = log.date.toISOString().split('T')[0];
      if (!dailyMap[dayKey]) dailyMap[dayKey] = { hoursWorked: 0, overtimeHours: 0, notes: [] };
      dailyMap[dayKey].hoursWorked += log.duration || 0;
      // Optional: overtime calculation
      const overtime = log.duration > 8 ? log.duration - 8 : 0;
      dailyMap[dayKey].overtimeHours += overtime;
      if (log.isLate) dailyMap[dayKey].notes.push('Late');
    });

    const hoursArray = Object.entries(dailyMap).map(([date, data]) => ({
      date: new Date(date),
      hoursWorked: data.hoursWorked,
      overtimeHours: data.overtimeHours,
      notes: data.notes.join('; '),
    }));

    // Create Timesheet document
    await Timesheet.create({
      employee: emp._id,
      periodStart: start,
      periodEnd: end,
      hours: hoursArray,
      status: 'Draft',
    });

    console.log(`Timesheet created for employee ${emp._id}`);
  }
}

// Schedule the cron job: Every Monday at 1 AM
cron.schedule('0 1 * * 1', async () => {
  try {
    await generateWeeklyTimesheets();
    console.log('Weekly timesheet automation completed.');
  } catch (err) {
    console.error('Timesheet automation error:', err);
  }
});
