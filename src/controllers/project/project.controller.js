import { Project } from "../../models/project/ProjectModel.js";
import { Board } from "../../models/project/BoardMode.js";
import { Workflow } from "../../models/project/WorkflowModel.js";
import { AutomationRule } from "../../models/project/automationModel.js";
import { ProjectTemplate } from "../../models/project/ProjectTemplateModel.js";
import { ProjectMember } from "../../models/project/projectMemberModel.js";
import { AuditLog } from "../../models/project/auditLogModel.js";
import { Workspace } from "../../models/project/WorkspaceModel.js";
import { Task } from "../../models/project/TaskModel.js";
import User from "../../models/userModel.js";
import { OrgMember } from "../../models/OrganisationMemberSchema.js";
import { Member } from "../../models/project/MemberModel.js";
import { RolePermission } from "../../models/RolePermission.js";
import mongoose from "mongoose";
import {
  addMemberSchema,
  createProjectSchema,
  projectIdSchema,
} from "../../validations/project/project.js";
import { workspaceIdSchema } from "../../validations/project/workspace.js";

export const createProject = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user.userId;
    const orgId = req.orgUser.orgId;
    const { workspaceId } = req.params;
    const parsed = createProjectSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation error",
        errors: parsed.error.errors.map((e) => e.message),
      });
    }
    const { name, templateId, description, visibility } = parsed.data;

    // 🔍 Validate input
    if (!workspaceId || !mongoose.Types.ObjectId.isValid(workspaceId)) {
      return res
        .status(400)
        .json({ message: "Invalid workspace ID", code: 400 });
    }
    if (!name || !templateId) {
      return res
        .status(400)
        .json({ message: "Project name and template are required" });
    }

    // 🔍 Validate template & workspace
    const [template, workspace] = await Promise.all([
      ProjectTemplate.findById(templateId),
      Workspace.findById(workspaceId),
    ]);

    if (!template)
      return res.status(404).json({ message: "Project template not found" });
    if (!workspace)
      return res.status(404).json({ message: "Workspace not found" });

    // 🔍 Check duplicate project name
    const existingProject = await Project.findOne({
      name,
      workspace: workspace._id,
    });
    if (existingProject) {
      return res.status(400).json({ message: "Project name already taken" });
    }

    // ✅ Create Project
    const [project] = await Project.create(
      [
        {
          name,
          description: description || template.description || "",
          workspace: workspace._id,
          templateId: template._id,
          organization: orgId,
          visibility: visibility,
          type: template.boardType,
          createdBy: userId,
        },
      ],
      { session }
    );

    // ✅ Create Board Columns from Template Workflow
    if (!template.workflow?.states?.every((s) => s.key)) {
      return res
        .status(400)
        .json({ message: "Each workflow state must have a `key`" });
    }

    const boardColumns = template.workflow.states.map((state, index) => ({
      name: state.name,
      order: index,
      key: state.key.toLowerCase().trim(),
    }));

    await Board.create(
      [
        {
          projectId: project._id,
          name: `${name} Board`,
          type: template.boardType,
          columns: boardColumns,
        },
      ],
      { session }
    );

    // ✅ Create Workflow
    await Workflow.create(
      [
        {
          projectId: project._id,
          name: `${name} Workflow`,
          states: template.workflow.states,
          transitions: template.workflow.transitions || [],
        },
      ],
      { session }
    );

    // ✅ Create Automation Rules
    if (
      Array.isArray(template.automationRules) &&
      template.automationRules.length
    ) {
      const rules = template.automationRules.map((rule) => ({
        projectId: project._id,
        name: rule.name,
        description: rule.description,
        trigger: rule.trigger,
        conditions: rule.conditions,
        actions: rule.actions,
      }));
      await AutomationRule.insertMany(rules, { session });
    }

    // ✅ Add User as Project Member
    await ProjectMember.create(
      [
        {
          projectId: project._id,
          userId,
          role: "admin",
          addedBy: userId,
        },
      ],
      { session }
    );

    // ✅ Add Audit Log
    await AuditLog.create(
      [
        {
          projectId: project._id,
          userId,
          action: "CREATE_PROJECT",
          description: `Project '${name}' created with template '${template.name}'`,
        },
      ],
      { session }
    );

    // ✅ Generate Sample Tasks
    const generateKey = async (projectId) => {
      const count = await Task.countDocuments({ projectId });
      return `${project.slug}-task-${count + 1}`;
    };

    if (Array.isArray(template.task)) {
      const taskDocs = await Promise.all(
        template.task.map(async (taskTemplate) => ({
          projectId: project._id,
          key: await generateKey(project._id),
          summary: taskTemplate.summary,
          description: taskTemplate.description,
          type: taskTemplate.type,
          status: taskTemplate.status,
          columnOrder: taskTemplate.columnOrder,
          priority: taskTemplate.priority,
          labels: taskTemplate.labels,
          createdBy: userId,
        }))
      );

      await Task.insertMany(taskDocs, { session });
    }

    // ✅ Commit
    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      message: "Project created successfully",
      project,
    });
  } catch (error) {
    console.error("Error in createProject:", error);
    await session.abortTransaction();
    session.endSession();
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

// project member routes
export const assignMember = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const orgId = req.orgUser.orgId;

    // ✅ Validate request body
    const parsed = addMemberSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation error",
        errors: parsed.error.errors.map((e) => e.message),
      });
    }

    const { email, level, projectId, role: roleName } = parsed.data;

    // ✅ Validate IDs
    if (!mongoose.isValidObjectId(workspaceId)) {
      return res.status(400).json({ message: "Invalid workspaceId" });
    }
    if (level === "project" && !mongoose.isValidObjectId(projectId)) {
      return res.status(400).json({ message: "Invalid projectId" });
    }

    // ✅ Check user
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // ✅ Check if user is in organization
    const isOrgMember = await OrgMember.exists({
      userId: user._id,
      organizationId: orgId,
    });
    if (!isOrgMember) {
      return res.status(403).json({ message: "User is not in the organization" });
    }

    // ✅ Validate workspace
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) return res.status(404).json({ message: "Workspace not found" });

    // ✅ Fetch RolePermission
    const role = await RolePermission.findOne({ role: roleName });
    if (!role) return res.status(404).json({ message: "Role not found" });

    // ✅ Add to workspace (for both levels)
    const existingWorkspaceMember = await Member.findOne({
      userId: user._id,
      workspaceId,
      organizationId: orgId,
    });

    if (!existingWorkspaceMember) {
      await Member.create({
        userId: user._id,
        workspaceId,
        organizationId: orgId,
        role: role._id,
        invitedBy: req.user.userId,
      });
    }

    // ✅ If only adding to workspace
    if (level === "workspace") {
      if (existingWorkspaceMember) {
        return res.status(400).json({ message: "User already in workspace" });
      }
      return res.status(200).json({ message: "User added to workspace" });
    }

    // ✅ Add to project
    const project = await Project.findOne({
      _id: projectId,
      workspace: workspaceId,
    });
    if (!project) {
      return res.status(404).json({ message: "Project not found in workspace" });
    }

    const alreadyInProject = await ProjectMember.exists({
      userId: user._id,
      projectId,
    });

    if (alreadyInProject) {
      return res.status(400).json({ message: "User already in project" });
    }

    await ProjectMember.create({
      userId: user._id,
      projectId,
      workspaceId,
      organizationId: orgId,
      role: role._id,
      addedBy: req.user.userId,
    });

    return res.status(200).json({ message: "User added to project" });
  } catch (error) {
    console.error("Error assigning member:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getAllProjectMembers = async (req, res) => {
  try {
    const projectId = req.params.projectId;
    if (!projectId)
      return res.status(400).json({ message: "Project ID is required" });
    console.log("projectId", projectId);
    const members = await ProjectMember.find({ projectId });
    res
      .status(200)
      .json({ message: "All project members fetched successfully", members });
  } catch (error) {
    console.error("Error fetching project members:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
