import mongoose from 'mongoose';
const { Schema } = mongoose;

const payrollProcessingSchema = new Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmployeeProfile',
    required: true,
  },
  payrollPeriod: {
    type: Date,
    required: true,
  },
  grossPay: {
    type: Number,
    required: true,
  },
  deductions: {
    type: Number,
    default: 0,
  },
  netPay: {
    type: Number,
    default: 0,
  },
  paymentMethod: {
    type: String,
    enum: ['Direct Deposit', 'Check'],
    default: 'Direct Deposit',
  },
  status: {
    type: String,
    enum: ['Processed', 'Pending', 'Failed'],
    default: 'Pending',
    index: true,
  },
  salaryConfigurationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SalaryConfiguration',
  },
  taxCalculationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TaxCalculation',
  },
  payrollBatchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PayrollBatch',
  },
  remarks: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

payrollProcessingSchema.pre('save', function (next) {
  this.netPay = this.grossPay - this.deductions;
  next();
});

const PayrollProcessing = mongoose.model('PayrollProcessing', payrollProcessingSchema);

export default PayrollProcessing;