const mongoose = require('mongoose');

const projectTeamSchema = new mongoose.Schema(
  {
    projectTeamName: String,
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    status: { type: Boolean, default: true },
  },
  {
    timestamps: true, // Enable timestamps
  }
);

const ProjectTeam = mongoose.model('ProjectTeam', projectTeamSchema);

module.exports = ProjectTeam;
