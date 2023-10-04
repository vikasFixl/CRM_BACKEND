const mongoose = require('mongoose');

const payslipSchema = new mongoose.Schema(
  
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'Employees' },
    salaryMonth: Number,
    salaryYear: Number,
    salary: Number,
    paidLeave: Number,
    unpaidLeave: Number,
    monthlyHoliday: Number,
    publicHoliday: Number,
    workDay: Number,
    shiftWiseWorkHour: Number,
    monthlyWorkHour: Number,
    hourlySalary: Number,
    workingHour: Number,
    salaryPayable: Number,
    bonus: Number,
    bonusComment: String,
    deduction: Number,
    deductionComment: String,
    totalPayable: Number,
    paymentStatus: { type: String, default: 'UNPAID' },
  },
  {
    timestamps: true, // Enable timestamps
  }
);

payslipSchema.index({ userId: 1, salaryMonth: 1, salaryYear: 1 }, { unique: true });

const Payslip = mongoose.model('Payslip', payslipSchema);

module.exports = Payslip;
