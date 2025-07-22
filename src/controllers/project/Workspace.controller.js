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

    await Member.create(
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

    const user = await User.findById(userId, null, { session });
    if (!user) {
      await session.abortTransaction();
      return res.status(404).json({ message: "User not found" });
    }

    user.currentWorkspace = workspace[0]._id;
    await user.save({ session });

    await session.commitTransaction();
    res.status(201).json({
      message: "Workspace created successfully",
      workspace: workspace[0],
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

    res.status(200).json({
      success: true,
      message: "Workspace fetched successfully",
      workspace,
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
    const projectsCount = await Project.countDocuments({ workspace: workspaceId });

    const membersCount = await Member.countDocuments({ workspaceId });

    const projectIds = await Project.find({ workspace: workspaceId }, { _id: 1 }).lean();
    const projectIdList = projectIds.map(p => p._id);

    const [activeTasks, completedTasks] = await Promise.all([
      Task.countDocuments({ projectId: { $in: projectIdList }, status: { $ne: "Done" } }),
      Task.countDocuments({ projectId: { $in: projectIdList }, status: "Done" }),
    ]);

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

    res.status(200).json({
      success: true,
      message: "Workspace analytics fetched successfully",
      analytics: {
        projectsCount,
        membersCount,
        activeTasks,
        completedTasks,
        workloadPerMember,
      },
    });
  } catch (err) {
    next(err);
  }
};