import mongoose from 'mongoose';
const { Schema } = mongoose;

const taxBreakdownSchema = new Schema({
  type: { type: String, required: true }, // e.g., IncomeTax, ProvidentFund, ProfessionalTax
  amount: { type: Schema.Types.Decimal128, required: true },
  description: String,
});

const taxCalculationSchema = new Schema({
  employee: { type: Schema.Types.ObjectId, ref: 'EmployeeProfile', required: true, index: true },
  payrollProcessing: { type: Schema.Types.ObjectId, ref: 'PayrollProcessing', index: true }, // link to payroll entry
  payrollPeriod: { type: Date, required: true, index: true },
  fiscalYear: { type: String }, // e.g., "2024-2025"
  grossIncome: { type: Schema.Types.Decimal128, required: true },
  calculatedAt: { type: Date, default: Date.now },
  isAutoCalculated: { type: Boolean, default: true },
  breakdown: { type: [taxBreakdownSchema], default: [] },
  totalTaxes: { type: Schema.Types.Decimal128, default: 0 },
  netIncome: { type: Schema.Types.Decimal128, default: 0 },
  ruleVersion: { type: String }, // reference the tax rules version used
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  deleted: { type: Boolean, default: false },
}, { timestamps: true });

taxCalculationSchema.pre('save', function (next) {
  // compute totals
  const total = (this.breakdown || []).reduce((acc, b) => acc + parseFloat(b.amount?.toString() || '0'), 0);
  this.totalTaxes = total;
  const gross = parseFloat(this.grossIncome?.toString() || '0');
  this.netIncome = gross - total;
  next();
});

taxCalculationSchema.index({ employee: 1, payrollPeriod: 1 });

export default mongoose.model('TaxCalculation', taxCalculationSchema);
