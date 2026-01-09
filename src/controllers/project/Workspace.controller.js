import {
  workspaceSchema,
} from "../../validations/project/workspace.js";
import { Workspace } from "../../models/project/WorkspaceModel.js";
import { Member } from "../../models/project/MemberModel.js";
import { Project } from "../../models/project/ProjectModel.js";
import User from "../../models/userModel.js";
import { RolePermission } from "../../models/RolePermission.js";
import { Task } from "../../models/project/TaskModel.js";
import mongoose from "mongoose";
import { Team } from "../../models/project/TeamModel.js";
import { generateWorkspaceToken, setWorkspaceCookie } from "../../utils/generatetoken.js";
import { OrgMember } from "../../models/OrganisationMemberSchema.js";
import { sendCustomEmail } from "../../../config/nodemailer.config.js";
export const createWorkspace = async (req, res, next) => {
  const { userId } = req.user;
  const { orgId } = req.orgUser;

  const parsed = workspaceSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: "Validation error",
      errors: parsed.error.errors.map((e) => e.message),
    });
  }

  const { name, description } = parsed.data;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const exists = await Workspace.exists({ createdBy: userId, name }, { session });
    if (exists) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Name already taken" });
    }

    const user = await User.findById(userId).session(session);
    if (!user) {
      await session.abortTransaction();
      return res.status(404).json({ message: "User not found" });
    }

    const workspace = await Workspace.create(
      [
        {
          name,
          description,
          createdBy: userId,
          orgId,
        },
      ],
      { session }
    );

    if (!workspace || !workspace[0]) {
      await session.abortTransaction();
      return res.status(500).json({ message: "Workspace creation failed" });
    }

    const ownerRole = await RolePermission.findOne({ role: "WorkspaceAdmin" }, null, { session });
    if (!ownerRole) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Owner role not found" });
    }

    const member = await Member.create(
      [
        {
          userId,
          workspaceId: workspace[0]._id,
          organizationId: orgId,
          role: ownerRole._id,
          joinedAt: new Date(),
        },
      ],
      { session }
    );

    if (!member || !member[0]) {
      await session.abortTransaction();
      return res.status(500).json({ message: "Failed to assign member role" });
    }

    const role = await RolePermission.findById(member[0].role).select("role permissions");
    if (!role) {
      await session.abortTransaction();
      return res.status(403).json({ message: "Role not found" });
    }

    const perm = member[0].hascustompermission ? member[0].permissionsOverride : role.permissions;

    const payload = {
      workspaceId: workspace[0]._id,
      userId,
      role: role.role,
      permissions: perm,
      roleId: role._id,
    };

    const workspaceToken = generateWorkspaceToken(payload);
    setWorkspaceCookie(res, workspaceToken);

    user.currentWorkspace = workspace[0]._id;
    await user.save({ session });

    await session.commitTransaction();

    res.status(201).json({
      message: "Workspace created successfully",
      workspace: workspace[0],
      workspaceToken,
    });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
};

export const updateWorkspace = async (req, res, next) => {
  const id = req.params.id;
  const parsed = workspaceSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Validation error",
      errors: parsed.error.errors.map((e) => e.message),
    });
  }

  const { name, description } = parsed.data;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const workspace = await Workspace.findById(id, null, { session });
    if (!workspace) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Workspace not found" });
    }

    workspace.name = name;
    workspace.description = description;
    await workspace.save({ session });

    await session.commitTransaction();
    res.status(200).json({
      message: "Workspace updated successfully",
      workspace,
    });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
};
export const deleteWorkspace = async (req, res, next) => {
  const id = req.params.id;
  const { orgId } = req.orgUser;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const workspace = await Workspace.findOneAndUpdate(
      { _id: id, orgId, isDeleted: { $ne: true } },
      { isDeleted: true },
      { new: true, session }
    );

    if (!workspace) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Workspace not found or already deleted" });
    }

    await Promise.all([
      Project.updateMany({ workspace: id, orgId }, { isDeleted: true }, { session }),
      Member.updateMany({ workspaceId: id, organizationId: orgId }, { isDeleted: true }, { session }),
    ]);

    await session.commitTransaction();
    res.status(200).json({
      message: "Workspace soft-deleted successfully",
      workspace,
    });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
};
// admin access route
export const getAllWorkspace = async (req, res, next) => {
  const { orgId } = req.orgUser;

  try {
    const workspaces = await Workspace.find({ orgId, isDeleted: false }).sort({ createdAt: -1 });
    res.status(200).json({
      message: "All workspaces in the organization fetched successfully",
      workspaces,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Internal server error " });
  }
};
export const getMyWorkspace = async (req, res, next) => {
  const { orgId } = req.orgUser;
  const { userId } = req.user;

  try {
    const memberships = await Member.findActive({
      userId,
      organizationId: orgId,
      status: "active",
    }).select("workspaceId");

    const workspaceIds = memberships.map((m) => m.workspaceId);

    const workspaces = await Workspace.find({
      _id: { $in: workspaceIds },
      orgId,
      isDeleted: false,
    })
      .sort({ createdAt: -1 })
      .select("_id name");
    res.status(200).json({
      message: "Workspaces fetched successfully",
      workspaces,
    });
  } catch (err) {
    next(err);
  }
};
export const getWorkspaceById = async (req, res, next) => {
  const id = req.params.workspaceId;
  const userId = req.user.userId;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid workspace ID" });
  }


  try {
    const workspace = await Workspace.findById(id)
      .populate("createdBy", "_id firstName lastName email")
      .lean();

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }
    // find the member of the workspace
    const member = await Member.findOne({
      workspaceId: id,
      userId,
      isDeleted: false,
    });

    if (!member) {
      return res.status(403).json({ message: "You are not a member of this workspace" });
    }
    const role = await RolePermission.findById(member.role).select("role permissions");
    if (!role) {
      return res.status(403).json({ message: "role not found" });
    }
    const perm = member.hascustompermission ? member.permissionsOverride : role.permissions
    let payload = {
      workspaceId: id,
      userId: userId,
      role: role.role,
      permissions: perm,
      roleId: role._id
    }
    const worksapcetoken = generateWorkspaceToken(payload)
    setWorkspaceCookie(res, worksapcetoken)


    res.status(200).json({
      success: true,
      message: "Workspace fetched successfully",
      workspace,
      workspaceToken: worksapcetoken
    });
  } catch (err) {
    next(err);
  }
};
export const getWorkspaceAnalytics = async (req, res, next) => {
  const workspaceId = req.params.workspaceId;

  if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
    return res.status(400).json({ message: "Invalid workspace ID" });
  }

  try {
    // Count total projects in the workspace
    const projectsCount = await Project.countDocuments({ workspace: workspaceId });

    // Count total members in the workspace
    const membersCount = await Member.countDocuments({ workspaceId });

    // Get project IDs in the workspace
    const projectIds = await Project.find({ workspace: workspaceId }, { _id: 1 }).lean();
    const projectIdList = projectIds.map(p => p._id);

    // Count active and completed tasks
    const [activeTasks, completedTasks] = await Promise.all([
      Task.countDocuments({ projectId: { $in: projectIdList }, status: { $ne: "Done" } }),
      Task.countDocuments({ projectId: { $in: projectIdList }, status: "Done" }),
    ]);

    // Get workload per member
    const workloadPerMember = await Task.aggregate([
      {
        $match: {
          projectId: { $in: projectIdList },
          assigneeId: { $ne: null },
        },
      },
      {
        $group: {
          _id: "$assigneeId",
          taskCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "projectmembers",
          localField: "_id",
          foreignField: "_id",
          as: "projectMember",
        },
      },
      { $unwind: "$projectMember" },
      {
        $lookup: {
          from: "users",
          localField: "projectMember.userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: 0,
          userId: "$user._id",
          name: {
            $concat: ["$user.firstName", " ", { $ifNull: ["$user.lastName", ""] }],
          },
          email: "$user.email",
          taskCount: 1,
        },
      },
    ]);

    // Get total teams under the workspace
    const totalTeams = await Team.countDocuments({ workspaceId });

    // Get teams per project
    const teamsPerProject = await Team.aggregate([
      {
        $match: {
          projectId: { $in: projectIdList },
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: "$projectId",
          teamCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "projects",
          localField: "_id",
          foreignField: "_id",
          as: "project",
        },
      },
      { $unwind: "$project" },
      {
        $project: {
          _id: 0,
          projectId: "$_id",
          projectName: "$project.name",
          teamCount: 1,
        },
      },
    ]);

    // Get project-wise task distribution
    const projectWiseTaskDistribution = await Task.aggregate([
      {
        $match: {
          projectId: { $in: projectIdList },
        },
      },
      {
        $group: {
          _id: "$projectId",
          totalTasks: { $sum: 1 },
          activeTasks: { $sum: { $cond: [{ $ne: ["$status", "Done"] }, 1, 0] } },
          completedTasks: { $sum: { $cond: [{ $eq: ["$status", "Done"] }, 1, 0] } },
        },
      },
      {
        $lookup: {
          from: "projects",
          localField: "_id",
          foreignField: "_id",
          as: "project",
        },
      },
      { $unwind: "$project" },
      {
        $project: {
          _id: 0,
          projectId: "$_id",
          projectName: "$project.name",
          totalTasks: 1,
          activeTasks: 1,
          completedTasks: 1,
        },
      },
    ]);

    // Get team-wise task distribution
    const teamIds = await Team.find({ workspaceId }, { _id: 1 }).lean();
    const teamIdList = teamIds.map(t => t._id);

    const teamWiseTaskDistribution = await Task.aggregate([
      {
        $match: {
          projectId: { $in: projectIdList },
          teamId: { $in: teamIdList },
        },
      },
      {
        $group: {
          _id: "$teamId",
          totalTasks: { $sum: 1 },
          activeTasks: { $sum: { $cond: [{ $ne: ["$status", "Done"] }, 1, 0] } },
          completedTasks: { $sum: { $cond: [{ $eq: ["$status", "Done"] }, 1, 0] } },
        },
      },
      {
        $lookup: {
          from: "teams",
          localField: "_id",
          foreignField: "_id",
          as: "team",
        },
      },
      { $unwind: "$team" },
      {
        $project: {
          _id: 0,
          teamId: "$_id",
          teamName: "$team.name",
          totalTasks: 1,
          activeTasks: 1,
          completedTasks: 1,
        },
      },
    ]);

    // Get tasks per team
    const tasksPerTeam = await Task.aggregate([
      {
        $match: {
          projectId: { $in: projectIdList },
          teamId: { $in: teamIdList },
        },
      },
      {
        $group: {
          _id: "$teamId",
          taskCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "teams",
          localField: "_id",
          foreignField: "_id",
          as: "team",
        },
      },
      { $unwind: "$team" },
      {
        $project: {
          _id: 0,
          teamId: "$_id",
          teamName: "$team.name",
          taskCount: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      message: "Workspace analytics fetched successfully",
      analytics: {
        projectsCount,
        membersCount,
        activeTasks,
        completedTasks,
        workloadPerMember,
        totalTeams,
        teamsPerProject,
        projectWiseTaskDistribution,
        teamWiseTaskDistribution,
        tasksPerTeam,
      },
    });
  } catch (err) {
    next(err);
  }
};
export const workspacemember = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;
    const { orgId } = req.orgUser;

    // Pagination inputs with max limit 50
    let limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    // Base query
    const query = { workspaceId, organizationId: orgId, isDeleted: false };

    // Add filters if provided
    if (req.query.customPermission !== undefined) {
      query.hasCustomPermission = req.query.customPermission === "true";
    }
    if (req.query.isDeleted) {
      query.isDeleted = req.query.isDeleted === "true";
    }

    // Workspace existence check
    const workspaceExists = await Workspace.exists({ _id: workspaceId, organizationId: orgId });
    if (!workspaceExists) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    // Email filter (applied inside populate)
    const emailFilter = req.query.email
      ? { email: { $regex: req.query.email, $options: "i" } }
      : {};

    // Fetch total count
    const totalMembers = await Member.countDocuments(query);

    // Fetch members with filters + pagination
    const members = await Member.find(query)
      .select(
        "_id userId role hasCustomPermission joinedAt status permissionsOverride createdAt updatedAt isDeleted"
      )
      .populate({
        path: "userId",
        select: "email firstName lastName",
        match: emailFilter,
      })
      .populate({
        path: "role",
        select: "role permissions",
      })
      .skip(skip)
      .limit(limit)
      .lean();

    // Filter out members without matching user
    const finalMembers = members
      .filter(m => m.userId)
      .map(m => ({
        _id: m._id,
        email: m.userId.email,
        role: m.role?.role || null,
        hasCustomPermission: m.hasCustomPermission,
        status: m.status,
        joinedAt: m.joinedAt,
        createdAt: m.createdAt,
        updatedAt: m.updatedAt,
        isDeleted: m.isDeleted,
        permissions: m.hasCustomPermission
          ? m.permissionsOverride || []
          : m.role?.permissions || [],
      }));

    return res.status(200).json({
      message: "Workspace members fetched successfully",
      members: finalMembers,
      pageInfo: {
        currentPage: Number(page),
        hasNextPage: skip + members.length < totalMembers,
        totalPages: Math.ceil(totalMembers / limit),
        limit: limit,
        totalMembers
      }
    });
  } catch (error) {
    logger.error("Error at workspace member:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const AddworkspaceMember = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { email, role } = req.body;
    const { userId } = req.user
    const { orgId } = req.orgUser; // org user from auth

    // 2. Check if user exists
    const user = await User.findOne({ email }).select("_id");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 3. Check if user belongs to organization
    const isOrgMember = await OrgMember.exists({
      organizationId: orgId,
      userId: user._id
    });
    if (!isOrgMember) {
      return res.status(403).json({ message: "User not part of organization" });
    }

    // 1. Check if workspace exists
    const workspaceExists = await Workspace.exists({ _id: workspaceId, organizationId: orgId });
    if (!workspaceExists) {
      return res.status(404).json({ message: "Workspace not found" });
    }



    // find role 
    const Role = await RolePermission.findOne({ role })
    if (!Role) {
      return res.status(404).json({ message: "Role not found" });
    }


    // 4. Check if already a workspace member
    const memberExists = await Member.exists({
      workspaceId,
      organizationId: orgId,
      userId: user._id,
    });
    if (memberExists) {
      return res.status(400).json({ message: "User already a member of this workspace" });
    }

    // 5. Create workspace member
    const member = await Member.create({
      userId: user._id,
      workspaceId,
      organizationId: orgId,
      role: Role._id, // you can set a default role if not passed
      invitedBy: userId
    });

    return res.status(201).json({
      message: "Member added successfully",
      member
    });
  } catch (error) {
    logger.error("Error at AddMember:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const RemoveworkspaceMember = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { email, reason } = req.body;
    const { orgId } = req.orgUser;
    const { userId } = req.user; // the one performing the removal

    // 1. Check if workspace exists in organization
    const workspace = await Workspace.findOne({ _id: workspaceId, organizationId: orgId }).select("name");
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    // 2. Check if user exists
    const user = await User.findOne({ email }).select("_id firstName lastName email");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 3. Check if user is a workspace member
    const member = await Member.findOne({
      workspaceId,
      organizationId: orgId,
      userId: user._id,
      isDeleted: false
    });
    if (!member) {
      return res.status(404).json({ message: "User is not a member of this workspace" });
    }

    // 4. Soft delete the membership
    member.isDeleted = true;
    member.removalReason = reason || "Removed from workspace";
    member.status = "removed";
    await member.save();

    // 5. Send email notification
    try {
      const subject = `You have been removed from ${workspace.name}`;
      const body = `
        <p>Hi ${user.firstName || "there"},</p>
        <p>You have been removed from the workspace <strong>${workspace.name}</strong>.</p>
        <p><strong>Reason:</strong> ${reason || "No reason provided."}</p>
        <p>If you believe this is a mistake, please contact the workspace admin.</p>
        <br/>
        <p>– FixlCRM Team</p>
      `;
      await sendCustomEmail({
        to: user.email,
        subject: subject,
        html: body, // if body is HTML
      });

    } catch (emailError) {
      logger.error("Error sending removal email:", emailError.message);
      // don’t block the API just because email failed
    }

    return res.status(200).json({
      message: "Member removed successfully",
      removedMember: {
        _id: member._id,
        userId: member.userId,
        workspaceId: member.workspaceId,
        removedBy: userId,
        removalReason: member.removalReason,
        removedAt: new Date()
      }
    });
  } catch (error) {
    logger.error("Error at RemoveworkspaceMember:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};





