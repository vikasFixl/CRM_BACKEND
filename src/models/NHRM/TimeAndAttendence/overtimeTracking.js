import mongoose from 'mongoose';
const { Schema } = mongoose;

const overtimeSchema = new Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmployeeProfile',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  hours: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ['Voluntary', 'Mandatory'],
    default: 'Voluntary',
  },
  compensationRate: Number, // Optional multiplier (e.g., 1.5x, 2x)
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
    index: true,
  },
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

overtimeSchema.index({ date: 1, status: 1 });

const Overtime = mongoose.model('Overtime', overtimeSchema);

export default Overtime;