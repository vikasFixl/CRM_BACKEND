const mongoose = require('mongoose');

const leavePolicySchema = new mongoose.Schema(
  {
    name: { type: String, unique: true },
    paidLeaveCount: Number,
    unpaidLeaveCount: Number,
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Employees' }],
    status: { type: Boolean, default: true },
  },
  {
    timestamps: true, // Enable timestamps
  }
);

const LeavePolicy = mongoose.model('LeavePolicy', leavePolicySchema);

module.exports = LeavePolicy;
