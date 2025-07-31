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
    const exists = await Workspace.findOne({ createdBy: userId, name }, null, { session });
    if (exists) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Name already taken" });
    }

    const user = await User.findById(userId, { session });
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



    user.currentWorkspace = workspace[0]._id;
    await user.save({ session });

    await session.commitTransaction();
    res.status(201).json({
      message: "Workspace created successfully",
      workspace: workspace[0],
      workspaceToken: worksapcetoken
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
    next(err);
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
    }).sort({ createdAt: -1 });

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