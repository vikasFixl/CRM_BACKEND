import mongoose from 'mongoose';
const { Schema } = mongoose;

const attendanceSchema = new Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmployeeProfile',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  shiftType: {
    type: String,
    enum: ['Morning', 'Evening', 'Night', 'Flexible'],
  },
  absentReason: {
    type: String,
    enum: ['No Show', 'Uninformed Leave', 'Suspended'],
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Late', 'Leave'],
    default: 'Absent',
    index: true,
  },
  notes: String, // Additional notes about attendance
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

attendanceSchema.index({ date: 1, status: 1 });

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;