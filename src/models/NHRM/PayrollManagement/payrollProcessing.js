import mongoose from 'mongoose';
const { Schema } = mongoose;

/**
 * PayrollProcessing stores the generated payslip per employee per payroll cycle.
 * Use `payrollCycle` object or payrollPeriod Date to identify the month.
 */
const componentLineSchema = new Schema({
  key: { type: String, required: true }, // matching salary config keys
  label: String,
  type: { type: String, enum: ['EARNING', 'DEDUCTION'], required: true },
  amount: { type: Schema.Types.Decimal128, required: true },
});

const payrollProcessingSchema = new Schema({
  employee: { type: Schema.Types.ObjectId, ref: 'EmployeeProfile', required: true, index: true },
  payrollPeriod: { type: Date, required: true, index: true }, // typically set to first of month
  payrollCycleName: { type: String }, // e.g., "Mar 2025"
  components: { type: [componentLineSchema], default: [] }, // all lines (earnings + deductions)
  grossPay: { type: Schema.Types.Decimal128, required: true },
  totalDeductions: { type: Schema.Types.Decimal128, default: 0 },
  netPay: { type: Schema.Types.Decimal128, required: true },
  currency: { type: String, default: 'INR' },
  salaryConfiguration: { type: Schema.Types.ObjectId, ref: 'SalaryConfiguration' },
  taxCalculation: { type: Schema.Types.ObjectId, ref: 'TaxCalculation' },
  batch: { type: Schema.Types.ObjectId, ref: 'PayrollBatch', index: true },
  paymentMethod: { type: String, enum: ['Direct Deposit', 'Check', 'Manual'], default: 'Direct Deposit' },
  status: { type: String, enum: ['Pending', 'Processed', 'Approved', 'Paid', 'Failed', 'Reversed'], default: 'Pending', index: true },
  processedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  processedAt: Date,
  approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  approvedAt: Date,
  remarks: String,
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  deleted: { type: Boolean, default: false },
}, { timestamps: true });

/**
 * Pre-save sanity: compute totals from components
 */
payrollProcessingSchema.pre('save', function (next) {
  const earnings = (this.components || []).filter(c => c.type === 'EARNING')
    .reduce((s, c) => s + parseFloat(c.amount?.toString() || '0'), 0);
  const deductions = (this.components || []).filter(c => c.type === 'DEDUCTION')
    .reduce((s, c) => s + parseFloat(c.amount?.toString() || '0'), 0);

  this.grossPay = earnings;
  this.totalDeductions = deductions;
  this.netPay = earnings - deductions;
  next();
});

payrollProcessingSchema.index({ employee: 1, payrollPeriod: 1 }, { unique: true }); // one payslip per employee per period

export default mongoose.model('PayrollProcessing', payrollProcessingSchema);
