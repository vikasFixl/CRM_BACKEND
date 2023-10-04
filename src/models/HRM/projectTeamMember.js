const mongoose = require('mongoose');

const projectTeamMemberSchema = new mongoose.Schema(
  {
    projectTeam: { type: mongoose.Schema.Types.ObjectId, ref: 'ProjectTeam' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'Employees' },
    status: { type: Boolean, default: true },
  },
  {
    timestamps: true, // Enable timestamps
  }
);

const ProjectTeamMember = mongoose.model('ProjectTeamMember', projectTeamMemberSchema);

module.exports = ProjectTeamMember;
