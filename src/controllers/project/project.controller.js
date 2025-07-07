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

export const createProject = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Extract user and org data
    const userId = req.user.userId;
    const orgId = req.orgUser.orgId;
    const { workspaceId } = req.params;

    // Validate input
    const parsed = createProjectSchema.safeParse(req.body);
    if (!parsed.success) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        message: "Validation error",
        errors: parsed.error.errors.map((e) => e.message),
      });
    }

    const { name, templateId, description, visibility } = parsed.data;

    // Validate workspace ID
    if (!workspaceId || !mongoose.Types.ObjectId.isValid(workspaceId)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Invalid workspace ID" });
    }

    // Check required fields
    if (!name || !templateId) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Project name and template are required" });
    }

    // Fetch template and workspace in parallel
    const [template, workspace, existingProject] = await Promise.all([
      ProjectTemplate.findById(templateId).session(session),
      Workspace.findById(workspaceId).session(session),
      Project.findOne({ name, workspace: workspaceId }).session(session),
    ]);

    // Check existence
    if (!template) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Project template not found" });
    }
    if (!workspace) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Workspace not found" });
    }
    if (existingProject) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Project name already taken" });
    }

    // Validate workflow states
    if (!template.workflow?.states?.every((s) => s.key)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Each workflow state must have a `key`" });
    }

    // Prepare board columns from workflow states
    const boardColumns = template.workflow.states.map((state, index) => ({
      name: state.name,
      order: index,
      key: state.key.toLowerCase().trim(),
    }));

    // Get owner role
    const ownerRole = await RolePermission.findOne({ role: "ProjectOwner" }).session(session);
    if (!ownerRole) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Owner role not found" });
    }

    // Create all entities in a single transaction
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
      columns: boardColumns,
      workflow: workflow._id
    }], { session });

    // Update project with board reference
    project.boardId = board._id;
    await project.save({ session });

    // Create automation rules if they exist
    if (template.automationRules?.length > 0) {
      const rules = template.automationRules.map((rule) => ({
        projectId: project._id,
        ...rule
      }));
      await AutomationRule.insertMany(rules, { session });
    }

    // Add project owner
    await ProjectMember.create([{
      projectId: project._id,
      userId,
      role: ownerRole._id,
      addedBy: userId,
    }], { session });

    // Create audit log
    await AuditLog.create([{
      projectId: project._id,
      userId,
      action: "CREATE_PROJECT",
      description: `Project '${name}' created with template '${template.name}'`,
    }], { session });

    // Create sample tasks if they exist
    if (template.task?.length > 0) {
    
      const taskDocs = template.task.map((taskTemplate, index) => ({
        projectId: project._id,
        summary: taskTemplate.summary,
        description: taskTemplate.description,
        type: taskTemplate.type,
        status: taskTemplate.status,
        columnOrder: taskTemplate.columnOrder,
        priority: taskTemplate.priority,
        labels: taskTemplate.labels,
        createdBy: userId,
      }));
      await Task.insertMany(taskDocs, { session });
    }

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      message: "Project created successfully",
      project: {
        ...project.toObject(),
        workflowId: workflow._id,
        boardId: board._id
      },
    });
  } catch (error) {
    console.error("Error in createProject:", error);
    await session.abortTransaction().catch(() => {});
    session.endSession().catch(() => {});
    return res.status(500).json({
      message: "Failed to create project",
      error: error.message,
    });
  }
};

export const updateProject = async (req, res) => {
  try {
    // TODO: Implement logic to update project details
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

    await ProjectMember.deleteMany({ projectId }).session(session);
    await Task.deleteMany({ projectId }).session(session);
    await Board.deleteMany({ projectId }).session(session);
    await Workflow.deleteMany({ projectId }).session(session);
    await AuditLog.deleteMany({ projectId }).session(session);
    await Project.deleteOne({ _id: projectId, workspaceId }).session(session);

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

export const getProjectById = async (req, res) => {
  try {
    // ✅ Validate projectId and workspaceId
    const projectId = projectIdSchema.parse(req.params.projectId);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
    const orgId = req.orgUser.orgId;

    // ✅ Fetch the project
    const project = await Project.findOne({
      _id: projectId,
      workspace: workspaceId,
      organization: orgId,
    })
      .populate("createdBy", "email _id firstName lastName")
      .populate("workspace", "name _id")
      .populate("organization", "name _id")
      .populate("boardId", "_id columns")
      .lean();

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // ✅ Get unique project members
    const members = await ProjectMember.find({ project: projectId })
      .populate("userId", "email _id firstName lastName")
      .select("userId role")
      .lean();

    const uniqueMembersMap = new Map();
    for (const member of members) {
      uniqueMembersMap.set(member.userId._id.toString(), member); // prevent duplicates
    }
    const uniqueMembers = Array.from(uniqueMembersMap.values());

    project.projectMembers = uniqueMembers;

    // ✅ Return the project
    return res.status(200).json({
      message: "Project fetched successfully",
      project,
    });
  } catch (error) {
    console.error("❌ Error in getProjectById:", error);
    return res.status(500).json({ message: "Internal server error" });
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

    const userIds = projectMembers.map((pm) => pm.userId);

    // // 2. Fetch user details (excluding sensitive info)
    const users = await User.find({ _id: { $in: userIds } }).select(
      " email avatar"
    );

    res.status(200).json({
      message: "Assignable project members fetched successfully",
      users,
    });
  } catch (error) {
    console.error("Error in getAssignableMembers:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
