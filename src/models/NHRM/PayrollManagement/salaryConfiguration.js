import mongoose from 'mongoose';
const { Schema } = mongoose;

/**
 * SalaryConfiguration represents a versioned salary structure per employee (or org-level).
 * Components can be either fixed amount or percentage of base.
 */
const componentSchema = new Schema({
  key: { type: String, required: true }, // e.g., basic, hra, conveyance
  label: { type: String },
  type: { type: String, enum: ['EARNING', 'DEDUCTION'], required: true },
  mode: { type: String, enum: ['AMOUNT', 'PERCENT'], default: 'AMOUNT' },
  value: { type: Schema.Types.Decimal128, required: true }, // if percent store 10 for 10%
  isTaxable: { type: Boolean, default: true },
  sequence: { type: Number, default: 0 }, // ordering in payslip
});

const salaryConfigurationSchema = new Schema({
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
  employee: { type: Schema.Types.ObjectId, ref: 'EmployeeProfile', required: true, index: true },
  salaryType: { type: String, enum: ['Hourly', 'Monthly', 'Weekly'], required: true },
  base: { type: Schema.Types.Decimal128, required: true }, // base salary
  components: { type: [componentSchema], default: [] }, // earnings & deductions breakdown
  currency: { type: String, default: 'INR' },
  bonusEligible: { type: Boolean, default: false },
  effectiveFrom: { type: Date, required: true, index: true },
  effectiveTo: { type: Date },
  status: { type: String, enum: ['Active', 'Inactive', 'Archived'], default: 'Active', index: true },
  version: { type: Number, default: 1 }, // increment on any change
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  deleted: { type: Boolean, default: false },
}, { timestamps: true });

salaryConfigurationSchema.index({ employee: 1, effectiveFrom: 1 });

/**
 * Pre-save: bump version only when document is modified (you can implement diff detection if needed).
 */
salaryConfigurationSchema.pre('save', function (next) {
  if (this.isModified()) this.version = (this.version || 0) + 1;
  next();
});

export default mongoose.model('SalaryConfiguration', salaryConfigurationSchema);
