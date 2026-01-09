import mongoose from 'mongoose';
const { Schema } = mongoose;
const salaryStructureSchema = new Schema({
  organizationId: Schema.Types.ObjectId,
  employeeId: Schema.Types.ObjectId,

  basic: Number,
  hra: Number,
  allowances: Number,
  deductions: Number,

  gross: Number,
  net: Number,

  effectiveFrom: Date,
  isActive: Boolean
}, { timestamps: true });

salaryStructureSchema.index(
  { organizationId: 1, employeeId: 1, effectiveFrom: 1 }
);
export const SalaryStructureModel = mongoose.model('SalaryStructure', salaryStructureSchema);