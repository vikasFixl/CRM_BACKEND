// HR & Payroll Analyticsimport mongoose from 'mongoose';
const { Schema } = mongoose;

const hrPayrollAnalyticsSchema = new Schema({
  reportName: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  reportType: {
    type: String,
    enum: ['HR', 'Payroll'],
    required: true,
  },
  reportPeriod: {
    type: Date,
    required: true,
  },
  metrics: [
    {
      metricName: String,
      value: Number,
    },
  ],
  insights: [String],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

hrPayrollAnalyticsSchema.index({ reportName: 1, reportPeriod: 1 });

const HRPayrollAnalytics = mongoose.model('HRPayrollAnalytics', hrPayrollAnalyticsSchema);

export default HRPayrollAnalytics;