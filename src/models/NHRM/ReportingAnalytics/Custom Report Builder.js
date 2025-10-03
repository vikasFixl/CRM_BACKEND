// Custom Report Builderimport mongoose from 'mongoose';
const { Schema } = mongoose;

const customReportSchema = new Schema({
  reportName: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  reportDescription: {
    type: String,
    required: true,
  },
  reportType: {
    type: String,
    enum: ['HR', 'Payroll', 'Performance', 'Recruitment'],
    required: true,
  },
  reportCriteria: {
    type: Object,
    required: true,
  },
  reportFormat: {
    type: String,
    enum: ['PDF', 'Excel', 'CSV'],
    required: true,
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

customReportSchema.index({ reportName: 1, reportType: 1 });

const CustomReport = mongoose.model('CustomReport', customReportSchema);

export default CustomReport;