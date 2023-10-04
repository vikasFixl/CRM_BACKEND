const mongoose = require('mongoose');

const taskStatusSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    name: String,
    status: { type: Boolean, default: true },
  },
  {
    timestamps: true, // Enable timestamps
  }
);

taskStatusSchema.index({ projectId: 1, name: 1 }, { unique: true });

const TaskStatus = mongoose.model('TaskStatus', taskStatusSchema);

module.exports = TaskStatus;
