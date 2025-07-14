// controllers/teamController.js
import mongoose from "mongoose";
import { Team } from "../models/project/TeamModel.js";
import { TeamMember } from "../models/project/TeamMemberModel.js";
import {projectmember} from "../models/project/ProjectMemberModel.js"
import { Workflow } from "../../models/project/WorkflowModel.js";
import { ProjectTemplate } from "../../models/project/ProjectTemplateModel.js";
import { Board } from "../../models/project/BoardMode.js";

// Utility to validate ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// ✅ Create a new Team// ✅ Create a new Team (enhanced version)
export const createTeam = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const { name, description, workspaceId, useTeamBoard, templateId, projectId } = req.body;
    const createdBy = req.user._id;

    if (!name || !workspaceId || !projectId) {
      return res.status(400).json({ success: false, message: "name, workspaceId and projectId are required" });
    }

    if (!isValidObjectId(workspaceId) || !isValidObjectId(projectId)) {
      return res.status(400).json({ success: false, message: "Invalid workspaceId or projectId" });
    }

    const existing = await Team.findOne({ name, workspaceId, isDeleted: false });
    if (existing) {
      return res.status(409).json({ success: false, message: "A team with this name already exists in this workspace" });
    }

    const newTeam = new Team({ name, description, workspaceId, createdBy });
    await newTeam.save({ session });

    // ✅ Create TeamMember document for the creator (assuming they're a project member)
    const projectMember = await ProjectMember.findOne({ 
      projectId, 
      userId: createdBy 
    }).session(session);
    
    if (!projectMember) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ 
        success: false, 
        message: "You must be a member of the project to create a team" 
      });
    }

    // Default role can be 'admin' or fetched from some configuration
    const defaultRole = await RolePermission.findOne({ name: "Team Admin" }).session(session);
    if (!defaultRole) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ 
        success: false, 
        message: "Default team role not found" 
      });
    }

    const teamMember = new TeamMember({
      teamId: newTeam._id,
      projectId,
      member: projectMember._id,
      role: defaultRole._id,
      addedBy: createdBy
    });
    await teamMember.save({ session });

    // Update members count
    await Team.findByIdAndUpdate(
      newTeam._id,
      { $inc: { membersCount: 1 } },
      { session }
    );

    // ✅ If user wants a team board
    if (useTeamBoard) {
      if (!templateId) {
        return res.status(400).json({ success: false, message: "Template ID required when using team board" });
      }

      if (!isValidObjectId(templateId)) {
        return res.status(400).json({ success: false, message: "Invalid templateId" });
      }

      const template = await ProjectTemplate.findById(templateId).session(session);
      if (!template || !template.workflow || !Array.isArray(template.workflow.states)) {
        return res.status(400).json({ success: false, message: "Invalid or missing template workflow" });
      }

      const workflow = await Workflow.create([{ 
        projectId,
        name: `${name} Team Workflow`,
        states: template.workflow.states,
        transitions: template.workflow.transitions,
        createdBy,
      }], { session });

      const columns = template.workflow.states.map((s, index) => ({
        name: s.name,
        order: index,
        key: s.key.toLowerCase().trim(),
      }));

      await Board.create([{
        name: `${name} Team Board`,
        type: template.boardType || "kanban",
        visibility: "team",
        projectId,
        teamId: newTeam._id,
        columns,
        workflow: workflow[0]._id,
        createdBy,
        deletable: true,
      }], { session });
    }

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ 
      success: true, 
      message: "Team created successfully", 
      team: newTeam,
      teamMember 
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ success: false, message: "Failed to create team", error: error.message });
  }
};


// ✅ Get all teams in a workspace
export const getTeamsByWorkspace = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    if (!isValidObjectId(workspaceId)) {
      return res.status(400).json({ success: false, message: "Invalid workspaceId" });
    }

    const teams = await Team.find({ workspaceId, isDeleted: false }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, teams });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch teams", error: error.message });
  }
};

// ✅ Add member to a team
export const addTeamMember = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { projectId, member, role } = req.body;
    const addedBy = req.user._id;

    if (!teamId || !projectId || !member || !role) {
      return res.status(400).json({ success: false, message: "teamId, projectId, member, and role are required" });
    }

    if (![teamId, projectId, member, role].every(isValidObjectId)) {
      return res.status(400).json({ success: false, message: "One or more invalid ObjectId(s) provided" });
    }

    const existing = await TeamMember.findOne({ teamId, member });
    if (existing) {
      return res.status(409).json({ success: false, message: "User already exists in the team" });
    }

    const teamMember = new TeamMember({ teamId, projectId, member, role, addedBy });
    await teamMember.save();

    await Team.findByIdAndUpdate(teamId, { $inc: { membersCount: 1 } });

    res.status(201).json({ success: true, message: "Member added to team", teamMember });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to add member", error: error.message });
  }
};

// ✅ Get members of a team
export const getTeamMembers = async (req, res) => {
  try {
    const { teamId } = req.params;
    if (!isValidObjectId(teamId)) {
      return res.status(400).json({ success: false, message: "Invalid teamId" });
    }

    const members = await TeamMember.find({ teamId, isRemoved: false })
      .populate({ path: "member", populate: { path: "userId", select: "name avatar" } })
      .populate("role")
      .lean();

    res.status(200).json({ success: true, members });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to get members", error: error.message });
  }
};

// ✅ Remove member from team
export const removeTeamMember = async (req, res) => {
  try {
    const { teamId, memberId } = req.params;
    if (!isValidObjectId(teamId) || !isValidObjectId(memberId)) {
      return res.status(400).json({ success: false, message: "Invalid teamId or memberId" });
    }

    const member = await TeamMember.findOneAndUpdate(
      { teamId, member: memberId, isRemoved: false },
      { isRemoved: true },
      { new: true }
    );

    if (!member) {
      return res.status(404).json({ success: false, message: "Team member not found or already removed" });
    }

    await Team.findByIdAndUpdate(teamId, { $inc: { membersCount: -1 } });

    res.status(200).json({ success: true, message: "Member removed from team" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to remove member", error: error.message });
  }
};

// ✅ Archive or unarchive a team
export const toggleArchiveTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { archive } = req.body;

    if (!isValidObjectId(teamId)) {
      return res.status(400).json({ success: false, message: "Invalid teamId" });
    }

    const team = await Team.findByIdAndUpdate(
      teamId,
      { isArchived: archive },
      { new: true }
    );

    if (!team) {
      return res.status(404).json({ success: false, message: "Team not found" });
    }

    res.status(200).json({ success: true, message: `Team ${archive ? "archived" : "unarchived"}`, team });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update team archive state", error: error.message });
  }
};

// ✅ Soft delete a team
export const deleteTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    if (!isValidObjectId(teamId)) {
      return res.status(400).json({ success: false, message: "Invalid teamId" });
    }

    const team = await Team.findByIdAndUpdate(
      teamId,
      { isDeleted: true },
      { new: true }
    );

    if (!team) {
      return res.status(404).json({ success: false, message: "Team not found" });
    }

    res.status(200).json({ success: true, message: "Team deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete team", error: error.message });
  }
};
