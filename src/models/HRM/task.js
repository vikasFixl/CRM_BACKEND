const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    milestone: { type: mongoose.Schema.Types.ObjectId, ref: 'Milestone' },
    name: String,
    startDate: Date,
    endDate: Date,
    completionTime: Number,
    description: String,
    priority: { type: mongoose.Schema.Types.ObjectId, ref: 'Priority' },
    status: { type: Boolean, default: true },
  },
  {
    timestamps: true, // Enable timestamps
  }
);

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
