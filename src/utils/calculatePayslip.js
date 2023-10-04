const getHolidaysInMonth = require("./getHolidaysInMonth");

const User = require('../models/HRM/employee'); // Import the Mongoose User model
const Attendance = require('../models/HRM//attendance'); // Import the Mongoose Attendance model
const PublicHoliday = require('../models/HRM//publicHoliday'); // Import the Mongoose PublicHoliday model

const calculatePayslip = async (salaryMonth, salaryYear) => {
  // Get all employee salary and show in payroll
  const allEmployees = await User.find({})
    .select('id firstName lastName salaryHistory weeklyHoliday leaveApplication')
    .populate({
      path: 'salaryHistory',
      options: { sort: { id: -1 }, limit: 1 }, // Get only the latest salary
      select: 'salary',
    })
    .populate('weeklyHoliday')
    .populate({
      path: 'leaveApplication',
      match: {
        status: 'ACCEPTED',
        acceptLeaveFrom: {
          $gte: new Date(`${salaryYear}-${salaryMonth}-01`),
        },
        acceptLeaveTo: {
          $lte: new Date(`${salaryYear}-${parseInt(salaryMonth) + 1}-01`),
        },
      },
      select: 'leaveType leaveDuration',
    });

  // Get working hours of each employee
  const allEmployeeWorkingHours = await Attendance.find({
    inTime: {
      $gte: new Date(`${salaryYear}-${salaryMonth}-01`),
      $lt: new Date(`${salaryYear}-${parseInt(salaryMonth) + 1}-01`),
    },
  }).select('userId totalHour');

  // Calculate work days in a month based on publicHoliday collection
  const publicHoliday = await PublicHoliday.countDocuments({
    date: {
      $gte: new Date(`${salaryYear}-${salaryMonth}-01`),
      $lt: new Date(`${salaryYear}-${parseInt(salaryMonth) + 1}-01`),
    },
  });

  // Calculate payslip data for each employee
  const payslips = allEmployees.map((employee) => {
    const dayInMonth = new Date(salaryYear, salaryMonth, 0).getDate();
    const shiftWiseWorkHour = parseFloat(employee.weeklyHoliday.workHour.toFixed(2));
    const salary = employee.salaryHistory[0]?.salary || 0;
    const paidLeave = employee.leaveApplication
      .filter((leave) => leave.leaveType === 'PAID')
      .reduce((acc, leave) => acc + leave.leaveDuration, 0);
    const unpaidLeave = employee.leaveApplication
      .filter((leave) => leave.leaveType === 'UNPAID')
      .reduce((acc, leave) => acc + leave.leaveDuration, 0);
    const monthlyHoliday = getHolidaysInMonth(
      salaryYear,
      salaryMonth,
      employee.weeklyHoliday.startDay,
      employee.weeklyHoliday.endDay
    );
    const monthlyWorkHour = parseFloat(
      ((dayInMonth - monthlyHoliday - publicHoliday) * shiftWiseWorkHour).toFixed(2)
    );

    const hourlySalary = parseFloat((salary / monthlyWorkHour).toFixed(2));

    const workingHour = parseFloat(
      (allEmployeeWorkingHours
        .filter((hours) => hours.userId.equals(employee._id))
        .reduce((acc, hours) => acc + hours.totalHour, 0) || 0).toFixed(2)
    );

    const salaryPayable = parseFloat(
      (
        workingHour * hourlySalary +
        paidLeave * shiftWiseWorkHour * hourlySalary
      ).toFixed(2)
    );

    const totalPayable = parseFloat((salaryPayable + employee.bonus - employee.deduction).toFixed(2));

    return {
      id: employee._id,
      firstName: employee.firstName,
      lastName: employee.lastName,
      salaryMonth: parseInt(salaryMonth),
      salaryYear: parseInt(salaryYear),
      salary: salary,
      paidLeave: paidLeave,
      unpaidLeave: unpaidLeave,
      monthlyHoliday: monthlyHoliday,
      publicHoliday: publicHoliday,
      workDay: dayInMonth - monthlyHoliday - publicHoliday,
      shiftWiseWorkHour: shiftWiseWorkHour,
      monthlyWorkHour: monthlyWorkHour,
      hourlySalary: hourlySalary,
      bonus: 0,
      bonusComment: '',
      deduction: 0,
      deductionComment: '',
      totalPayable: totalPayable,
    };
  });

  // Sort the payslip array by id
  payslips.sort((a, b) => a.id - b.id);

  return payslips;
};

// Helper function to calculate holidays in a month
// function getHolidaysInMonth(year, month, startDay, endDay) {
//   // Logic to calculate holidays in a month based on startDay and endDay
//   // ...

//   return holidaysCount;
// }

module.exports = calculatePayslip;
