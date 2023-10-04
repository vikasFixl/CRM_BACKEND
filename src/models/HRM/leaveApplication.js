const mongoose = require('mongoose');

const leaveApplicationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'Employees' },
    leaveType: String,
    leaveFrom: Date,
    leaveTo: Date,
    acceptLeaveFrom: Date,
    acceptLeaveTo: Date,
    acceptLeaveBy: Number,
    leaveDuration: Number,
    reason: String,
    reviewComment: String,
    attachment: String,
    status: { type: String, default: 'PENDING' },
  },
  {
    timestamps: true, // Enable timestamps
  }
);

const LeaveApplication = mongoose.model('LeaveApplication', leaveApplicationSchema);

module.exports = LeaveApplication;
