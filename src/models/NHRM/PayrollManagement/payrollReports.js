import mongoose from 'mongoose';
const { Schema } = mongoose;

/**
 * PayrollReport is a snapshot/document representing aggregated payroll data for auditing/export.
 * It stores reportDetails as a denormalized snapshot to avoid recomputing historical numbers.
 */
const reportDetailSchema = new Schema({
  employee: { type: Schema.Types.ObjectId, ref: 'EmployeeProfile' },
  grossPay: { type: Schema.Types.Decimal128 },
  deductions: { type: Schema.Types.Decimal128 },
  netPay: { type: Schema.Types.Decimal128 },
  payrollProcessingId: { type: Schema.Types.ObjectId, ref: 'PayrollProcessing' },
});

const payrollReportSchema = new Schema({
  payrollPeriod: { type: Date, required: true, index: true },
  payrollCycleName: { type: String },
  reportType: { type: String, enum: ['Monthly', 'Quarterly', 'Yearly', 'Audit'], default: 'Monthly' },
  generatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  generatedAt: { type: Date, default: Date.now },
  totalEmployees: { type: Number, default: 0 },
  totalGrossPay: { type: Schema.Types.Decimal128, default: 0 },
  totalDeductions: { type: Schema.Types.Decimal128, default: 0 },
  totalNetPay: { type: Schema.Types.Decimal128, default: 0 },
  reportDetails: { type: [reportDetailSchema], default: [] },
  reportFileUrl: String, // link to generated PDF/CSV
  notes: String,
  deleted: { type: Boolean, default: false },
}, { timestamps: true });

payrollReportSchema.index({ payrollPeriod: 1, reportType: 1 });

export default mongoose.model('PayrollReport', payrollReportSchema);
