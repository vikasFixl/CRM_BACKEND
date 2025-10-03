import mongoose from 'mongoose';
const { Schema } = mongoose;

const certificationTrackingSchema = new Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmployeeProfile',
    required: true,
  },
  certificationName: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  certificationDate: {
    type: Date,
    required: true,
  },
  expirationDate: {
    type: Date,
  },
  issuingOrganization: {
    type: String,
    required: true,
  },
  certificationUrl: String, // URL to certification document
  status: {
    type: String,
    enum: ['Active', 'Expired', 'Pending'],
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

certificationTrackingSchema.index({ certificationDate: 1, expirationDate: 1, status: 1 });

const CertificationTracking = mongoose.model('CertificationTracking', certificationTrackingSchema);

export default CertificationTracking;