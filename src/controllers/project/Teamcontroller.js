// controllers/teamController.js
import mongoose from "mongoose";

import { Team } from "../../models/project/TeamModel.js"
import { Workflow } from "../../models/project/WorkflowModel.js";
import { ProjectTemplate } from "../../models/project/ProjectTemplateModel.js";
import { Board } from "../../models/project/BoardMode.js";
import { ProjectMember } from "../../models/project/projectMemberModel.js";
import { RolePermission } from "../../models/RolePermission.js";
import { TeamMember } from "../../models/project/TeamMemberModel.js";
import { Project } from "../../models/project/ProjectModel.js"

// Utility to validate ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);




export const createTeam = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { name, description, workspaceId, useTeamBoard, templateId, projectId } = req.body;
    const createdBy = req.user.userId;


    // basic checks
    if (!name || !workspaceId || !projectId)
      return res.status(400).json({ success: false, message: "name, workspaceId and projectId are required" });
    if (!isValidObjectId(workspaceId) || !isValidObjectId(projectId))
      return res.status(400).json({ success: false, message: "Invalid workspaceId or projectId" });

    // existence checks
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "project not found" });

    const existing = await Team.findOne({ name, workspaceId, projectId, isDeleted: false });
    if (existing) return res.status(409).json({ success: false, message: "Team name already exists in this project" });

    const projectMember = await ProjectMember.findOne({ projectId });
    if (!projectMember) return res.status(400).json({ success: false, message: "You must be a project member" });

    const teamRole = await RolePermission.findOne({ name: "TeamAdmin" });
    if (!teamRole) return res.status(400).json({ success: false, message: "Default role not found" });

    // create team
    const team = await Team.create({ name, description, workspaceId, projectId, createdBy, membersCount: 1, hasBoard: true });

    // add creator as team member
    await TeamMember.create({ teamId: team._id, member: projectMember._id, role: teamRole._id, projectId, addedBy: createdBy });

    // create board & workflow if requested
    if (!useTeamBoard) {
      if (!isValidObjectId(templateId))
        return res.status(400).json({ success: false, message: "templateId required when useTeamBoard = false" });

      const template = await ProjectTemplate.findById(templateId);
      if (!template?.workflow?.states?.length)
        return res.status(400).json({ success: false, message: "Invalid template workflow" });

      const workflow = await Workflow.create({
        projectId,
        name: `${name} Team Workflow`,
        states: template.workflow.states,
        transitions: template.workflow.transitions || [],
        createdBy,
      });

      const columns = template.workflow.states.map((s, idx) => ({
        name: s.name,
        order: idx,
        key: s.key.toLowerCase().trim(),
      }));

      await Board.create({
        name: `${name} Team Board`,
        type: template.boardType || "kanban",
        visibility: "team",
        projectId,
        teamId: team._id,
        workflow: workflow._id,
        columns,
        createdBy,
        deletable: true,
      });
    }
// get all task and attack to team ohk 
// dont update only update when the board is diffrent
    // attach team to project board & workflow
    const projectBoard = await Board.findById(project.boardId);
    if (!projectBoard) return res.status(404).json({ message: "Project board not found" });

    await Board.updateOne({ _id: projectBoard._id }, { teamId: team._id });
    await Workflow.updateOne({ _id: projectBoard.workflow }, { teamId: team._id });

    res.status(201).json({ success: true, message: "Team created successfully", team });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to create team", error: err.message });
  }
};



//  Get all teams in a proejct 
export const getTeamsByWorkspace = async (req, res) => {
  try {
    const { workspaceId, projectId } = req.query;

    // --- basic validation ---
    if (!workspaceId && !projectId)
      return res.status(400).json({ success: false, message: "Either workspaceId or projectId is required" });

    if (workspaceId && !isValidObjectId(workspaceId))
      return res.status(400).json({ success: false, message: "Invalid workspaceId" });
    if (projectId && !isValidObjectId(projectId))
      return res.status(400).json({ success: false, message: "Invalid projectId" });

    // --- pagination defaults ---
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 100); // max 100
    const skip = (page - 1) * limit;

    // --- filter ---
    const filter = { isDeleted: false };
    if (workspaceId) filter.workspaceId = workspaceId;
    if (projectId) filter.projectId = projectId;

    // --- counts & data ---
    const totalCount = await Team.countDocuments(filter);
    const teams = await Team.find(filter)
      .populate("createdBy", "email")
      .populate("projectId", "name")
      .select("-__v")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.status(200).json({
      success: true,
      message: "Teams fetched successfully",
      teams,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit) || 1,
        totalRecords: totalCount,
        hasNext: skip + teams.length < totalCount,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch teams", error: error.message });
  }
};

//  Add member to a team
export const addTeamMember = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { projectId, member, role } = req.body;
    const addedBy = req.user.userId         // global User model

    // --- basic validation
    if (!teamId || !projectId || !member || !role) {
      return res.status(400).json({ success: false, message: "teamId, projectId, member, and role are required" });
    }
    if (![teamId, projectId, member].every(isValidObjectId)) {
      return res.status(400).json({ success: false, message: "One or more invalid ObjectId(s) provided" });
    }

    // --- check duplicates (unique index on {teamId, member})
    const existing = await TeamMember.findOne({ teamId, member, isRemoved: false });
    if (existing) {
      return res.status(409).json({ success: false, message: "User already exists in the team" });
    }

    if (role == "TeamAdmin") {
      return res.status(409).status({ message: "cannot assign this role " })
    }
    // find role from the db 
    const teamrole = await RolePermission.findOne({ role })
    if (!teamrole) {
      return res.status(404).json({ message: "role not found " })
    }
    // --- create record
    const teamMember = await TeamMember.create({
      teamId,
      projectId,
      member,      // ProjectMember _id
      role: teamrole._id,
      addedBy,     // User _id
      isRemoved: false,
    });

    // --- bump counter
    await Team.findByIdAndUpdate(teamId, { $inc: { membersCount: 1 } });

    res.status(201).json({ success: true, message: "Member added to team", teamMember });
  } catch (error) {
    if (error.code === 11000) { // duplicate key
      return res.status(409).json({ success: false, message: "User already exists in the team" });
    }
    res.status(500).json({ success: false, message: "Failed to add member", error: error.message });
  }
};


// Function to get all members of a specific team within a specific project
export const getTeamMembers = async (req, res) => {
  try {
    const { teamId } = req.params;            // Get teamId from URL path parameter
    const { projectId } = req.query;          // Get projectId from query parameter

    /* ✅ Step 1: Input Validation */
    if (!teamId || !isValidObjectId(teamId))
      return res.status(400).json({ success: false, message: "Invalid teamId" });

    if (!projectId || !isValidObjectId(projectId))
      return res.status(400).json({ success: false, message: "projectId query param is required" });

    /* ✅ Step 2: Check if the team exists in the specified project */
    const teamExists = await Team.exists({ _id: teamId, projectId });
    if (!teamExists)
      return res.status(404).json({ success: false, message: "Team not found for the given project" });

    /* ✅ Step 3: Aggregation pipeline to fetch detailed member information */
    const members = await TeamMember.aggregate([
      {
        // Match all active members (not removed) in this team and project
        $match: {
          teamId: new mongoose.Types.ObjectId(teamId),
          projectId: new mongoose.Types.ObjectId(projectId),
        
        },
      },
      // 1️⃣ Join TeamMember.member -> ProjectMember._id
      {
        $lookup: {
          from: "projectmembers",           // Collection to join from
          localField: "member",             // Local field (TeamMember.member)
          foreignField: "_id",              // Foreign field (ProjectMember._id)
          as: "pm",                         // Output array field
        },
      },
      { $unwind: "$pm" }, // Flatten pm array to object

      // Join ProjectMember.userId -> User._id
      {
        $lookup: {
          from: "users",
          localField: "pm.userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },

      // 2️⃣ Join TeamMember.role -> RolePermission._id
      {
        $lookup: {
          from: "rolepermissions",
          localField: "role",
          foreignField: "_id",
          as: "role",
        },
      },
      { $unwind: "$role" },

      // 3️⃣ Join TeamMember.addedBy -> User._id
      {
        $lookup: {
          from: "users",
          localField: "addedBy",
          foreignField: "_id",
          as: "addedByUser",
        },
      },
      {
        // Flatten addedByUser, allow null if not available
        $unwind: { path: "$addedByUser", preserveNullAndEmptyArrays: true },
      },

      // 4️⃣ Project (select) final fields to send in response
      {
        $project: {
          _id: 1,
          email: "$user.email",
          avatar: "$user.avatar.url",
          firstName: "$user.firstName",
          roleName: "$role.name",
          permissions: "$role.permissions",
          hasCustomPermission: 1,
          createdAt: 1,

          // Who added this member
          addedBy: {
            _id: "$addedByUser._id",
            email: "$addedByUser.email",
            avatar: "$addedByUser.avatar.url",
          },
        },
      },
    ]);

    /* ✅ Step 4: Send the result back */
    res.status(200).json({ success: true,total:members.length, members });
  } catch (err) {
    // Error handler
    res.status(500).json({ success: false, message: "Failed to get members", error: err.message });
  }
};


//  Remove member from team
export const removeTeamMember = async (req, res) => {
  try {
    const { teamId, memberId:tmid } = req.params; //tm id is team ember id
    const { projectId } = req.query
    
    if (!isValidObjectId(teamId) || !isValidObjectId(tmid)) {
      return res.status(400).json({ success: false, message: "Invalid teamId or memberId" });
    }

    // hard-delete (permanently remove from DB)
    const result = await TeamMember.findOneAndDelete(
      { teamId, _id: tmid, projectId }
    );

    if (!result)
      return res.status(404).json({ success: false, message: "Member not found in team" });

    // optionally decrement counter
    await Team.findByIdAndUpdate(teamId, { $inc: { membersCount: -1 } });

    res.status(200).json({ success: true, message: "Member permanently removed" });




  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to remove member", error: error.message });
  }
};


//  Archive or unarchive a team
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



export const deleteTeam = async (req, res) => {
  try {
    const { teamId} = req.params;
    const { projectId }=req.query;

    if (!isValidObjectId(teamId) || !isValidObjectId(projectId)) {
      return res.status(400).json({ success: false, message: "Invalid teamId or projectId" });
    }

    // Permanently delete the team with matching projectId
    const deletedTeam = await Team.findOneAndDelete({ _id: teamId, projectId });

    if (!deletedTeam) {
      return res.status(404).json({ success: false, message: "Team not found" });
    }

    // Optionally, delete associated team members
    await TeamMember.deleteMany({ teamId, projectId });

    res.status(200).json({ success: true, message: "Team and its members permanently deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete team", error: error.message });
  }
};

