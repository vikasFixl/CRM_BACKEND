import mongoose from 'mongoose';
const { Schema } = mongoose;

const legalStatutoryReportSchema = new Schema({
  reportName: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  reportType: {
    type: String,
    enum: ['Legal', 'Statutory'],
    required: true,
  },
  reportDate: {
    type: Date,
    required: true,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Submitted', 'Overdue'],
    default: 'Pending',
    index: true,
  },
  reportContent: {
    type: String,
    required: true,
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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

legalStatutoryReportSchema.index({ reportDate: 1, dueDate: 1, status: 1 });

const LegalStatutoryReport = mongoose.model('LegalStatutoryReport', legalStatutoryReportSchema);

export default LegalStatutoryReport;