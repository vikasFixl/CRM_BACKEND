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

export const createWorkspace = async (req, res) => {
  try {
    const userId = req.user.userId;
    const orgId = req.orgUser.orgId;
    const parsed = workspaceSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation error",
        errors: parsed.error.errors.map((e) => e.message),
      });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const { name, description } = parsed.data;
    // cheeck if workspace name exists
    const exists = await Workspace.findOne({ createdBy: userId, name })
    if (exists) {
      return res.status(400).json({ message: "name already taken " })
    }
    const workspace = await Workspace.create({
      name,
      description,
      createdBy: userId,
      orgId: orgId,
    });
    await workspace.save();
    // find the owner role and add it to the workspace
    const ownerRole = await RolePermission.findOne({ role: "WorkspaceAdmin" });
    if (!ownerRole) {
      return res.status(404).json({ message: "Owner role not found" });
    }

    // CREATE MEMBER
    const member = await Member.create({
      userId: userId,
      workspaceId: workspace._id,
      organizationId: orgId,
      role: ownerRole._id,
      joinedAt: new Date(),
    });
    await member.save();
    user.currentWorkspace = workspace._id;
    await user.save();

    return res.status(201).json({
      message: "Workspace created successfully",
      workspace,
    });
  } catch (error) {
    console.error("Create workspace error:", error);
    await Workspace.deleteOne({ _id: Workspace._id });
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
export const updateworkspace = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ message: "Workspace id is required" });
    }

    const parsed = workspaceSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation error",
        errors: parsed.error.errors.map((e) => e.message),
      });
    }
    const { name, description } = parsed.data;

    const workspace = await Workspace.findById(id);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }
    workspace.name = name;
    workspace.description = description;
    await workspace.save();
    return res
      .status(200)
      .json({ message: "Workspace updated successfully", workspace });
  } catch (error) {
    console.error("Update workspace error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
export const deleteWorkspace = async (req, res) => {
  try {
    const id = req.params.id;
    const OrgId = req.orgUser.orgId;
    if (!id) {
      return res.status(400).json({ message: "Workspace ID is required" });
    }

    const workspace = await Workspace.findOneAndUpdate(
      { _id: id, orgId: OrgId, isDeleted: { $ne: true } }, // avoid re-deleting
      { isDeleted: true },
      { new: true }
    );

    if (!workspace) {
      return res
        .status(404)
        .json({ message: "Workspace not found or already deleted" });
    }

    // Optional: Soft delete related Projects and Members
    await Promise.all([
      Project.updateMany({ workspace: id, orgId: OrgId }, { isDeleted: true }),
      Member.updateMany(
        { workspaceId: id, organizationId: OrgId },
        { isDeleted: true }
      ),
    ]);

    return res.status(200).json({
      message: "Workspace soft-deleted successfully",
      workspace,
    });
  } catch (error) {
    console.error("Delete workspace error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
// admin access route
export const getAllWorkspace = async (req, res) => {
  try {
    const orgId = req.orgUser.orgId;

    const workspaces = await Workspace.find({
      orgId,
      isDeleted: false,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      message: "All workspaces in the organization fetched successfully",
      workspaces,
    });
  } catch (error) {
    console.error("Error fetching org workspaces:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const getMyWorkspace = async (req, res) => {
  try {
    const orgId = req.orgUser.orgId;
    const userId = req.user.userId;


    let workspaces;


    // Regular user: Get only workspaces where user is a member
    const memberships = await Member.findActive({
      userId,
      organizationId: orgId,
      status: "active",
    }).select("workspaceId");

    const workspaceIds = memberships.map((m) => m.workspaceId);

    workspaces = await Workspace.find({
      _id: { $in: workspaceIds },
      orgId,
      isDeleted: false,
    }).sort({ createdAt: -1 });


    return res.status(200).json({
      message: "Workspaces fetched successfully",
      workspaces,
    });
  } catch (error) {
    console.error("Error fetching org workspaces:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const getWorkspaceById = async (req, res) => {
  try {
    const id = req.params.workspaceId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid workspace ID" });
    }

    const workspace = await Workspace.findById(id)
      .populate("createdBy", "_id firstName lastName email")
      .lean();

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Workspace fetched successfully",
      workspace,
    });
  } catch (error) {
    console.error("Error in getWorkspaceById:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const getWorkspaceAnalytics = async (req, res) => {
  try {
    const workspaceId = req.params.workspaceId;

    if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
      return res.status(400).json({ message: "Invalid workspace ID" });
    }

    // Count of projects in this workspace
    const projectsCount = await Project.countDocuments({ workspace: workspaceId });

    // Count of members in this workspace
    const membersCount = await Member.countDocuments({ workspaceId });

    // Count of all tasks in projects of this workspace
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
          _id: "$assigneeId", // Group by assigneeId (who is a ProjectMember)
          taskCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "projectmembers", // match your actual MongoDB collection name
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


    return res.status(200).json({
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
  } catch (error) {
    console.error("Error in getWorkspaceAnalytics:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};