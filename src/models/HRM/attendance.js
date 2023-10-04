const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee', // Replace 'User' with the actual Mongoose model name for users
    required: true,
  },
  inTime: {
    type: Date,  
    required: true,
  },
  outTime: {
    type: Date,
  },
  ip: {
    type: String,
  },
  comment: {
    type: String,
  },
  punchBy: {
    type: String,
  },
  totalHour: {
    type: Number,
  },
  inTimeStatus: {
    type: String,
  },
  outTimeStatus: {
    type: String,
  },
  status: {
    type: Boolean,
    default: true,
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

const Attendance = mongoose.model('Attendances', attendanceSchema);

module.exports = Attendance;
