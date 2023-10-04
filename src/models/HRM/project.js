const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    projectManager: { type: mongoose.Schema.Types.ObjectId, ref: 'Employees' },
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

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
