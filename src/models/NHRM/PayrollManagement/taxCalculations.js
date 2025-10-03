import mongoose from 'mongoose';
const { Schema } = mongoose;

const taxCalculationSchema = new Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmployeeProfile',
    required: true,
  },
  payrollPeriod: {
    type: Date,
    required: true,
  },
  grossIncome: {
    type: Number,
    required: true,
  },
  payrollId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PayrollProcessing',
  },
  taxYear: {
    type: Number,
    required: true,
  },
  isAutoCalculated: {
    type: Boolean,
    default: true,
  },
  federalTax: Number,
  stateTax: Number,
  localTax: Number,
  otherTaxes: Number,
  totalTaxes: {
    type: Number,
    default: 0,
  },
  netIncome: {
    type: Number,
    default: 0,
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

taxCalculationSchema.pre('save', function (next) {
  this.totalTaxes = this.federalTax + this.stateTax + this.localTax + (this.otherTaxes || 0);
  this.netIncome = this.grossIncome - this.totalTaxes;
  next();
});

const TaxCalculation = mongoose.model('TaxCalculation', taxCalculationSchema);

export default TaxCalculation;