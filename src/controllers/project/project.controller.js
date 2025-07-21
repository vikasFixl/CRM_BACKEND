import { Project } from "../../models/project/ProjectModel.js";
import { Board } from "../../models/project/BoardMode.js";
import { Workflow } from "../../models/project/WorkflowModel.js";
import { AutomationRule } from "../../models/project/automationModel.js";
import { ProjectTemplate } from "../../models/project/ProjectTemplateModel.js";
import { ProjectMember } from "../../models/project/projectMemberModel.js";
import { AuditLog } from "../../models/project/auditLogModel.js";
import { Workspace } from "../../models/project/WorkspaceModel.js";
import { Task } from "../../models/project/TaskModel.js";

import { RolePermission } from "../../models/RolePermission.js";
import mongoose from "mongoose";
import {
  createProjectSchema,
  projectIdSchema,
} from "../../validations/project/project.js";
import { workspaceIdSchema } from "../../validations/project/workspace.js";
import User from "../../models/userModel.js";
import { Team } from "../../models/project/TeamModel.js";
import { TeamMember } from "../../models/project/TeamMemberModel.js";

export const createProject = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const userId = req.user.userId;
    const orgId = req.orgUser.orgId;
    const { workspaceId } = req.params;

    console.log("req.body", req.body)
    const parsed = createProjectSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation error",
        errors: parsed.error.errors.map((e) => e.message),
      });
    }

    const { name, templateId, description, visibility } = parsed.data;

    if (!workspaceId || !mongoose.Types.ObjectId.isValid(workspaceId)) {
      return res.status(400).json({ message: "Invalid workspace ID" });
    }

    if (!name || !templateId) {
      return res.status(400).json({ message: "Project name and template are required" });
    }

    const [template, workspace, existingProject] = await Promise.all([
      ProjectTemplate.findById(templateId).session(session),
      Workspace.findById(workspaceId).session(session),
      Project.findOne({ name, workspace: workspaceId }).session(session),
    ]);

    if (!template) return res.status(404).json({ message: "Project template not found" });
    if (!workspace) return res.status(404).json({ message: "Workspace not found" });
    if (existingProject) return res.status(400).json({ message: "Project name already taken" });

    if (!template.workflow?.states?.every((s) => s.key)) {
      return res.status(400).json({ message: "Each workflow state must have a `key`" });
    }

    // const boardColumns = template.workflow.states.map((state, index) => ({
    //   name: state.name,
    //   order: index,
    //   key: state.key.toLowerCase().trim(),
    // }));

    const ownerRole = await RolePermission.findOne({ role: "ProjectAdmin" }).session(session);
    if (!ownerRole) return res.status(404).json({ message: "Owner role not found" });

    // Main creation flow
    const [project] = await Project.create([{
      name,
      description: description || template.description || "",
      workspace: workspace._id,
      templateId: template._id,
      organization: orgId,
      visibility,
      type: template.boardType,
      createdBy: userId,
    }], { session });

    const [workflow] = await Workflow.create([{
      projectId: project._id,
      name: `${name} Workflow`,
      states: template.workflow?.states,
      transitions: template.workflow?.transitions,
      createdBy: userId,
    }], { session });

    const [board] = await Board.create([{
      projectId: project._id,
      name: `${name} Board`,
      type: template.boardType,
      isProjectDefault: true,
      columns: template.boardColumns,
      workflow: workflow._id,
      createdBy: req.user.userId
    }], { session });

    project.boardId = board._id;
    await project.save({ session });

    if (template.automationRules?.length > 0) {
      const rules = template.automationRules.map((rule) => ({
        projectId: project._id,
        ...rule,
      }));
      await AutomationRule.insertMany(rules, { session });
    }

    await ProjectMember.create([{
      projectId: project._id,
      userId,
      role: ownerRole._id,
      addedBy: userId,
    }], { session });

    await AuditLog.create([{
      projectId: project._id,
      userId,
      action: "CREATE_PROJECT",
      description: `Project '${name}' created with template '${template.name}'`,
    }], { session });


    if (template.task?.length > 0) {
      const taskDocs = template.task.map((taskTemplate) => ({
        projectId: project._id,
        name: taskTemplate.summary,
        description: taskTemplate.description,
        type: taskTemplate.type,
        status: taskTemplate.status,
        columnOrder: taskTemplate.columnOrder,
        boardId: board._id,
        priority: taskTemplate.priority,
        labels: taskTemplate.labels,
        createdBy: userId,
      }));
      await Task.insertMany(taskDocs, { session });
    }

    await session.endSession();

    return res.status(201).json({
      message: "Project created successfully",
      project: {
        ...project.toObject(),
        workflowId: workflow._id,
        boardId: board._id,
      },
    });

  } catch (error) {
    console.error("Error in createProject:", error);
    await session.endSession();

    return res.status(error?.status || 500).json({
      message: error?.message || "Internal Server Error",
      ...(error.errors ? { errors: error.errors } : {}),
    });
  }
};

export const updateProject = async (req, res) => {
  try {

    res.status(200).json({ message: "updateProject route hit" });
  } catch (error) {
    console.error("Error in updateProject:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteProject = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const { workspaceId } = req.body;
    const projectId = projectIdSchema.parse(req.params.projectId);

    const orgId = req.orgUser.orgId;
    if (!workspaceId || !mongoose.Types.ObjectId.isValid(workspaceId))
      return res.status(400).json({ message: "Workspace ID is required" });
    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId))
      return res.status(400).json({ message: "Project ID is required" });
    const project = await Project.findOne({
      _id: projectId,
      workspace: workspaceId,
      organization: orgId,
    }).session(session);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    console.log(project);
    const team = Team.find({ projectId: projectId }).session(session)
    const teamIds = team.map(t => t._id);
    await ProjectMember.deleteMany({ projectId }).session(session);
    await Task.deleteMany({ projectId }).session(session);
    await Board.deleteMany({ projectId }).session(session);
    await Workflow.deleteMany({ projectId }).session(session);
    await AuditLog.deleteMany({ projectId }).session(session);
    await Project.deleteOne({ _id: projectId, workspaceId }).session(session);
    await TeamMember.deleteMany({ teamId: { $in: teamIds } }).session(session)
    await Team.deleteMany({ projectId }).session(session)
    await session.commitTransaction();
    session.endSession();
    return res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    await session.abortTransaction();
    console.error("Error in deleteProject:", error);
    return res.status(500).json({ message: "Internal server error" });
  } finally {
    session.endSession();
  }
};

export const archiveProject = async (req, res) => {
  try {
    // TODO: Archive a project
    res.status(200).json({ message: "archiveProject route hit" });
  } catch (error) {
    console.error("Error in archiveProject:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// admin routes 
export const getAllProjectsByWorkspace = async (req, res) => {
  try {
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const orgId = req.orgUser.orgId;
    if (!workspaceId || !mongoose.Types.ObjectId.isValid(workspaceId))
      return res.status(400).json({ message: "Workspace ID is required" });
    const {
      page = 1,
      limit = 10,
      visibility,
      isArchived,
      type,
      createdAt,
    } = req.query;
    const skip = (page - 1) * limit;

    const query = {};

    if (visibility) query.visibility = visibility;

    // Convert "true"/"false" strings to booleans
    if (isArchived === "true") query.isArchived = true;
    if (isArchived === "false") query.isArchived = false;

    if (type) query.type = type;
    if (orgId) query.organization = orgId;
    if (workspaceId) query.workspace = workspaceId;
    if (createdAt) query.createdAt = createdAt;

    const [projects, total] = await Promise.all([
      Project.find(query)
        .populate("createdBy", "email _id firstName lastName")
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 })
        .lean(),
      Project.countDocuments(query),
    ]);
    return res.status(200).json({
      message: "Projects fetched successfully",
      projects,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error in getAllProjectsByWorkspace:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const getMyProjectsByWorkspace = async (req, res) => {
  try {
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const userId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
      return res.status(400).json({ message: "Invalid workspace ID" });
    }

    // 1. Find all ProjectMember entries for this user
    const memberships = await ProjectMember.find({
      userId,
      isRemoved: false, // optional filter to ignore removed members
    }).select("projectId");
    console.log("memberships", memberships)

    // 2. Extract project IDs
    const projectIds = memberships.map((m) => m.projectId);

    // 3. Find projects in this workspace that match those IDs
    const projects = await Project.find({
      _id: { $in: projectIds },
      workspace: workspaceId,
    })
      .populate("createdBy", "email _id firstName lastName")
      .lean();

    return res.status(200).json({
      message: "User's projects in this workspace fetched successfully",
      projects,
    });
  } catch (error) {
    console.error("Error in getMyProjectsByWorkspace:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getProjectById = async (req, res) => {
  try {
    // ✅ Validate projectId and workspaceId first (fail fast)
    const { projectId } = req.params;
    const { orgId } = req.orgUser;

    const validatedProjectId = projectIdSchema.parse(projectId);


    // ✅ Use Promise.all for parallel operations
    const [project] = await Promise.all([
      Project.findOne({
        _id: validatedProjectId,
        organization: orgId,
      })
        .populate([
          { path: "createdBy", select: "email _id firstName lastName" },
          { path: "workspace", select: "name _id" },
          { path: "organization", select: "name _id" },
          { path: "boardId", select: "_id columns" }
        ])
        .lean(),

    ]);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }



    // ✅ Create new object to avoid modifying the lean result
    const responseData = {
      ...project
    };

    return res.status(200).json({
      message: "Project fetched successfully",
      project: responseData
    });

  } catch (error) {
    console.error("❌ Error in getProjectById:", error);

    // ✅ Better error differentiation
    if (error instanceof ZodError) {
      return res.status(400).json({ message: "Invalid input data" });
    }

    return res.status(500).json({
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getAssignableMembers = async (req, res) => {
  try {
    const projectId = req.params.projectId;

    if (!projectId) {
      return res.status(400).json({ message: "Project ID is required" });
    }

    // 1. Get all members assigned to the project
    const projectMembers = await ProjectMember.find({ projectId });

    if (projectMembers.length === 0) {
      return res.status(200).json({
        message: "No members assigned to this project",
        members: [],
      });
    }

    // 2. Get userIds and map memberId
    const memberDataMap = projectMembers.reduce((acc, member) => {
      acc[member.userId.toString()] = member._id;
      return acc;
    }, {});

    const userIds = Object.keys(memberDataMap);

    // 3. Fetch user details (email and avatar)
    const users = await User.find({ _id: { $in: userIds } }).select("email avatar");

    // 4. Combine user info with projectMember ID
    const members = users.map((user) => ({
      memberId: memberDataMap[user._id.toString()],
      userId: user._id,
      email: user.email,
      avatar: user.avatar || null,
    }));

    res.status(200).json({
      message: "Assignable project members fetched successfully",
      members,
    });
  } catch (error) {
    console.error("Error in getAssignableMembers:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getProjectAnalytics = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const taskMatch = { projectId: new mongoose.Types.ObjectId(projectId) };

    const totalTasks = await Task.countDocuments(taskMatch);

    const [completedTasks, pendingTasks, overdueTasks] = await Promise.all([
      Task.countDocuments({ ...taskMatch, status: "Done" }),
      Task.countDocuments({ ...taskMatch, status: { $ne: "Done" } }),
      Task.countDocuments({
        ...taskMatch,
        status: { $ne: "Done" },
        dueDate: { $lt: new Date() },
      }),
    ]);

    const tasksPerMember = await Task.aggregate([
      { $match: { ...taskMatch, assigneeId: { $ne: null } } },
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
          as: "member",
        },
      },
      { $unwind: "$member" },
      {
        $lookup: {
          from: "users",
          localField: "member.userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: 0,
          memberId: "$member._id",
          userId: "$user._id",
          email: "$user.email",
          avatar: "$user.avatar",
          name: { $concat: ["$user.firstName", " ", "$user.lastName"] },
          taskCount: 1,
        },
      },
    ]);

    // 🧩 Add tasksPerState grouping by status
    const tasksPerState = await Task.aggregate([
      { $match: taskMatch },
      {
        $group: {
          _id: "$status", // or "$workflowStateId" if using workflow states
          taskCount: { $sum: 1 },
        },
      },
      {
        $project: {
          state: "$_id",
          taskCount: 1,
          _id: 0,
        },
      },
    ]);

    res.status(200).json({
      message: "Project analytics fetched successfully",
      success: true,
      data: {
        totalTasks,
        completedTasks,
        pendingTasks,
        overdueTasks,
        tasksPerMember,
        tasksPerState,
      },
    });
  } catch (error) {
    console.error("Error in getProjectAnalytics:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

