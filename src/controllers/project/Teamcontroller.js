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
import { Task } from "../../models/project/TaskModel.js";
import { StatusCodes } from 'http-status-codes';
import { generateTeamToken, setTeamCookie } from "../../utils/generatetoken.js";

// Utility to validate ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
export const createTeam = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { name, description, workspaceId, useTeamBoard, templateId, projectId } = req.body;
    const createdBy = req.user.userId;

    /* ---------- basic & existence checks ---------- */
    if (!name || !workspaceId || !projectId)
      return res.status(400).json({ success: false, message: "name, workspaceId and projectId are required" });
    if (!isValidObjectId(workspaceId) || !isValidObjectId(projectId))
      return res.status(400).json({ success: false, message: "Invalid workspaceId or projectId" });

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "project not found" });

    const existing = await Team.findOne({ name, workspaceId, projectId, isDeleted: false });
    if (existing) return res.status(409).json({ success: false, message: "Team name already exists in this project" });

    const projectMember = await ProjectMember.findOne({ projectId });
    if (!projectMember) return res.status(400).json({ success: false, message: "You must be a project member" });

    const teamRole = await RolePermission.findOne({ name: "TeamAdmin" });
    if (!teamRole) return res.status(400).json({ success: false, message: "Default role not found" });

    /* ---------- create the team ---------- */
    const team = await Team.create({
      name,
      description,
      workspaceId,
      projectId,
      createdBy,
      membersCount: 1,
      hasTeamBoard: useTeamBoard !== false, // true unless explicitly false
    });

    /* ---------- add creator as team member ---------- */
    const teamMember = await TeamMember.create({
      teamId: team._id,
      member: projectMember._id,
      role: teamRole._id,
      projectId,
      addedBy: createdBy,
    });

    /* ---------- template branch (custom board) ---------- */
    if (useTeamBoard === false) {
      if (!isValidObjectId(templateId))
        return res.status(400).json({ success: false, message: "templateId required when useTeamBoard = false" });

      const template = await ProjectTemplate.findById(templateId);
      if (!template?.workflow?.states?.length)
        return res.status(400).json({ success: false, message: "Invalid template workflow" });

      const workflow = await Workflow.create({
        projectId: project._id,
        name: `${name} Workflow`,
        states: template.workflow?.states,
        transitions: template.workflow?.transitions,
        createdBy,
        teamId: team._id,
      });

      const columns = template.workflow.states.map((s, idx) => ({
        name: s.name,
        order: idx,
        key: s.key.toLowerCase().trim(),
      }));

      const board = await Board.create({
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
      team.boardId = board._id;
      await team.save()

      /* ---------- done – do NOT touch project board ---------- */
      await session.commitTransaction();
      return res.status(201).json({ success: true, message: "Team created with custom board", team });
    }

    /* ---------- no template – attach to project board ---------- */
    const projectBoard = await Board.findById(project.boardId);
    if (!projectBoard) return res.status(404).json({ message: "Project board not found" });

    await Board.updateOne({ _id: projectBoard._id }, { teamId: team._id });
    team.boardId = projectBoard._id;
    await team.save()
    await Workflow.updateOne({ _id: projectBoard.workflow }, { teamId: team._id });

    // find role 
    const role = await RolePermission.findOne({ _id: teamMember.role });
    if (!role) return res.status(404).json({ message: "Role not found" });
    const perm = teamMember.hascustompermission ? teamMember.permissionsOverride : role.permissions
    let payload = {
      permissions: perm,
      role: role.role,
      projectId: project,
      userId: createdBy
    }
    const teamtoken = generateTeamToken(payload)
    setTeamCookie(res, teamtoken)

    await session.commitTransaction();
    res.status(201).json({ success: true, message: "Team created and linked to project board", team, token: teamtoken });
  } catch (err) {
    await session.abortTransaction();
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to create team", error: err.message });
  } finally {
    session.endSession();
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
    res.status(200).json({ success: true, total: members.length, members });
  } catch (err) {
    // Error handler
    res.status(500).json({ success: false, message: "Failed to get members", error: err.message });
  }
};
//  Remove member from team
export const removeTeamMember = async (req, res) => {
  try {
    const { teamId, memberId: tmid } = req.params; //tm id is team ember id
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
export const changeMemberRoleInTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { projectId, memberId, role, overridepermissions } = req.body;

    if (role === "TeamAdmin") {
      return res.status(403).json({
        message: "Forbidden: Cannot assign 'TeamAdmin' role. Contact admin.",
      });
    }

    if (!projectId || !memberId || !role) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    if (
      !isValidObjectId(projectId) ||
      !isValidObjectId(memberId) ||
      !isValidObjectId(teamId)
    ) {
      return res.status(400).json({
        message: "Invalid teamId, projectId, or memberId.",
      });
    }

    // Find the team
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found." });
    }

    // Find the team member
    const member = await TeamMember.findOne({
      teamId: teamId,
      member: memberId,
    }).populate("role", "role permissions");

    if (!member) {
      return res.status(404).json({ message: "User is not part of the team." });
    }

    const currentRole = member.role?.role;
    const isRoleChanged = currentRole !== role;

    let updates = {};

    // Handle role change
    if (isRoleChanged) {
      const newRole = await RolePermission.findOne({ role });

      if (!newRole) {
        return res.status(404).json({ message: "Role not found." });
      }

      if (newRole.role === "TeamAdmin") {
        return res.status(403).json({
          message: "Forbidden: Cannot assign 'TeamAdmin' role.",
        });
      }

      updates.role = newRole._id;
      updates.permissionsOverride = [];
      updates.hasCustomPermission = false;
    }

    // Handle custom permission override (only if role not changed)
    if (
      !isRoleChanged &&
      Array.isArray(overridepermissions) &&
      overridepermissions.length > 0
    ) {
      updates.permissionsOverride = overridepermissions;
      updates.hasCustomPermission = true;
    }

    // Apply updates and save
    Object.assign(member, updates);
    await member.save();

    const finalPermissions = member.hasCustomPermission
      ? member.permissionsOverride
      : member.permissions;

    const formattedData = {
      memberId: member._id,
      role: member.role?.role,
      permissions: finalPermissions,
      hasCustomPermission: member.hasCustomPermission,
    };

    return res.status(200).json({
      message: `Team member role ${isRoleChanged ? "updated" : "retained"} as '${role}' ${!isRoleChanged ? "with custom permissions" : ""
        }`,
      formattedData,
    });
  } catch (error) {
    console.error("Error in changeMemberRoleInTeam:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
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
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { teamId } = req.params;
    const { projectId } = req.query;

    /* ---------- 1. Validate IDs ---------- */
    if (
      !mongoose.isValidObjectId(teamId) ||
      !mongoose.isValidObjectId(projectId)
    ) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ success: false, message: 'Invalid teamId or projectId' });
    }

    /* ---------- 2. Fetch team (to read hasTeamBoard & boardId) ---------- */
    const team = await Team.findOne({ _id: teamId, projectId })
      .select('hasTeamBoard boardId')
      .session(session);

    if (!team) {
      await session.abortTransaction();
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ success: false, message: 'Team not found' });
    }

    /* ---------- 3. Delete custom board + workflow (when no team board) ---------- */
    if (!team.hasTeamBoard && team.boardId) {
      const board = await Board.findById(team.boardId).session(session);
      if (board) {
        // delete workflow first (if exists)
        await Workflow.findByIdAndDelete(board.workflow).session(session);
        // delete board
        await Board.findByIdAndDelete(board._id).session(session);
      }
    }

    /* ---------- 4. Cascade remaining deletions ---------- */
    await Team.findByIdAndDelete(teamId).session(session);
    await TeamMember.deleteMany({ teamId, projectId }).session(session);
    await Task.updateMany(
      { assignedTeamId: teamId, projectId },
      { $set: { assignedTeamId: null } },
      { session }
    );

    await session.commitTransaction();
    return res
      .status(StatusCodes.OK)
      .json({ success: true, message: 'Team, members, task references, and related board/workflow removed' });
  } catch (error) {
    await session.abortTransaction();
    console.error('Delete team error:', error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: 'Failed to delete team', error: error.message });
  } finally {
    session.endSession();
  }
};


export const getMyTeamsByWorkspace = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const userId = req.user.userId;

    if (!mongoose.isValidObjectId(workspaceId))
      return sendErr(res, StatusCodes.BAD_REQUEST, 'Invalid workspace ID');

    /* 1️⃣  Get the ProjectMember record for this user */
    const projectMember = await ProjectMember.findOne({
      userId,
      isRemoved: false,
    });
    if (!projectMember)
      return res.status(StatusCodes.OK).json({ teams: [] });

    const memberId = projectMember._id;

    /* 2️⃣  Find all TeamMember rows that reference this ProjectMember */
    const memberships = await TeamMember.find({
      member: memberId,
      isRemoved: false,
    }).select('teamId');

    if (!memberships.length)
      return res.status(StatusCodes.OK).json({ teams: [] });

    const teamIds = memberships.map((m) => m.teamId);

    /* 3️⃣  Teams in the requested workspace */
    const teams = await Team.find({
      _id: { $in: teamIds },
      workspace: workspaceId,
    }).select('_id name workspcaeId projectId boardId hasTeamBoard slug')
      .lean();

    return res.status(StatusCodes.OK).json({
      message: ' teams  fetched successfully',
      teams,
    });
  } catch (error) {
    console.error('getMyTeamsByWorkspace:', error);
    return sendErr(res, StatusCodes.INTERNAL_SERVER_ERROR, 'Internal server error');
  }
};


export const getTeamById = async (req, res) => {
  try {
    const { teamId } = req.params;
    const team = await Team.findById(teamId).populate('createdBy', 'email _id firstName lastName');

    if (!team) return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Team not found' });
    // find the team member 
    // const teammember= await TeamMember.findOne({ teamId: team._id, member:memberId});
    return res.status(StatusCodes.OK).json({ success: true, team });
  } catch (error) {
    console.error('getTeamById:', error);
    return sendErr(res, StatusCodes.INTERNAL_SERVER_ERROR, 'Internal server error');
  }
};