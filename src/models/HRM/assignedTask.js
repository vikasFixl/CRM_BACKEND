const mongoose = require('mongoose');

const assignedTaskSchema = new mongoose.Schema(
  {
    task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: Boolean, default: true },
  },
  {
    timestamps: true, // Enable timestamps
  }
);

const AssignedTask = mongoose.model('AssignedTask', assignedTaskSchema);

module.exports = AssignedTask;
