import mongoose from 'mongoose';
const { Schema } = mongoose;

const salaryConfigurationSchema = new Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
  allowances: [
    {
      type: String, // e.g., HRA, Travel, Medical
      amount: Number,
    },
  ],
  deductions: [
    {
      type: String, // e.g., PF, Professional Tax
      amount: Number,
    },
  ],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmployeeProfile',
    required: true,
  },
  salaryType: {
    type: String,
    enum: ['Hourly', 'Salary'],
    required: true,
  },
  baseSalary: {
    type: Number,
    required: true,
  },
  bonus: Number,
  commission: Number,
  overtimeRate: Number,
  effectiveDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active',
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

salaryConfigurationSchema.index({ effectiveDate: 1, status: 1 });

const SalaryConfiguration = mongoose.model('SalaryConfiguration', salaryConfigurationSchema);

export default SalaryConfiguration;