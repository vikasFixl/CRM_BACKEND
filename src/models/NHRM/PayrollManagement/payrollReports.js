import mongoose from 'mongoose';
const { Schema } = mongoose;

const payrollReportSchema = new Schema({
  payrollPeriod: {
    type: Date,
    required: true,
  },
  totalEmployees: {
    type: Number,
    default: 0,
  },
  totalGrossPay: {
    type: Number,
    default: 0,
  },
  totalDeductions: {
    type: Number,
    default: 0,
  },
  totalNetPay: {
    type: Number,
    default: 0,
  },
  reportDetails: [
    {
      employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EmployeeProfile',
      },
      grossPay: Number,
      deductions: Number,
      netPay: Number,
    },
  ],
  reportType: {
    type: String,
    enum: ['Monthly', 'Yearly', 'Audit'],
    default: 'Monthly',
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  reportFileUrl: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

payrollReportSchema.index({ payrollPeriod: 1 });

const PayrollReport = mongoose.model('PayrollReport', payrollReportSchema);

export default PayrollReport;