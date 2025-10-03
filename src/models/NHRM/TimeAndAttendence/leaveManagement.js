import mongoose from 'mongoose';
const { Schema } = mongoose;

const leaveSchema = new Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmployeeProfile',
    required: true,
  },
  daysRequested: {
    type: Number,
    default: 0,
  },
  partialDay: {
    type: Boolean,
    default: false,
  },
  leaveHours: Number, // If partialDay is true
  supportingDocument: String,
  leaveType: {
    type: String,
    enum: ['Annual', 'Sick', 'Maternity', 'Parental', 'Unpaid', 'Other'],
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
    index: true,
  },
  reason: String,
  approvedBy: {
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

leaveSchema.index({ startDate: 1, endDate: 1, status: 1 });

const Leave = mongoose.model('Leave', leaveSchema);

export default Leave;