const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    name: String,
    startDate: Date,
    endDate: Date,
    description: String,
    status: { type: String, default: 'PENDING' },
  },
  {
    timestamps: true, // Enable timestamps
  }
);

const Milestone = mongoose.model('Milestone', milestoneSchema);

module.exports = Milestone;
