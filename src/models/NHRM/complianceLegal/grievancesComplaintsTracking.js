import mongoose from 'mongoose';
const { Schema } = mongoose;

const grievanceComplaintSchema = new Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmployeeProfile',
    required: true,
  },
  grievanceDate: {
    type: Date,
    required: true,
  },
  grievanceType: {
    type: String,
    enum: ['Work Environment', 'Harassment', 'Compensation', 'Other'],
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
    default: 'Open',
    index: true,
  },
  resolution: String,
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmployeeProfile',
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

grievanceComplaintSchema.index({ grievanceDate: 1, status: 1 });

const GrievanceComplaint = mongoose.model('GrievanceComplaint', grievanceComplaintSchema);

export default GrievanceComplaint;