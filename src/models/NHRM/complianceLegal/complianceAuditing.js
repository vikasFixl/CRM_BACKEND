import mongoose from 'mongoose';
const { Schema } = mongoose;

const complianceAuditSchema = new Schema({
  auditName: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  auditDate: {
    type: Date,
    required: true,
  },
  auditType: {
    type: String,
    enum: ['Internal', 'External'],
    required: true,
  },
  findings: [String],
  recommendations: [String],
  status: {
    type: String,
    enum: ['Open', 'Closed'],
    default: 'Open',
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

complianceAuditSchema.index({ auditDate: 1, status: 1 });

const ComplianceAudit = mongoose.model('ComplianceAudit', complianceAuditSchema);

export default ComplianceAudit;