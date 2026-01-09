import { Project } from "../../models/project/ProjectModel.js";
import { Board } from "../../models/project/BoardMode.js";
import { Workflow } from "../../models/project/WorkflowModel.js";
import { AutomationRule } from "../../models/project/automationModel.js";
import { ProjectTemplate } from "../../models/project/ProjectTemplateModel.js";
import { ProjectMember } from "../../models/project/projectMemberModel.js";
import { AuditLog } from "../../models/project/auditLogModel.js";
import { Workspace } from "../../models/project/WorkspaceModel.js";
import { Task } from "../../models/project/TaskModel.js";
import mongoose from "mongoose";


import { RolePermission } from "../../models/RolePermission.js";
import {
  createProjectSchema,
  projectIdSchema,
} from "../../validations/project/project.js";
import { workspaceIdSchema } from "../../validations/project/workspace.js";
import User from "../../models/userModel.js";
import { Team } from "../../models/project/TeamModel.js";
import { TeamMember } from "../../models/project/TeamMemberModel.js";
import { generateProjectToken, setProjectCookie } from "../../utils/generatetoken.js";
import { Member } from "../../models/project/MemberModel.js";

export const createProject = async (req, res) => {
  const session = await mongoose.startSession();

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

    const [projectMember] = await ProjectMember.create([{
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

    // find role 
    const role = await RolePermission.findById(projectMember.role).select("role permissions");
    const perm = projectMember.hascustompermission ? projectMember.permissionsOverride : role.permissions
    let payload = {
      permissions: perm,
      role: role.role,
      projectId: project._id,
      userId: userId
    }

    // generate proejct token 
    const projectToken = generateProjectToken(payload);
    setProjectCookie(res, projectToken);
    await session.endSession();

    return res.status(201).json({
      message: "Project created successfully",
      project: {
        ...project.toObject(),
        workflowId: workflow._id,
        boardId: board._id,
      },
      projecttoken: projectToken,
    });

  } catch (error) {
    logger.error("Error in createProject:", error);
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
    logger.error("Error in updateProject:", error);
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
    logger.info(project);
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
    logger.error("Error in deleteProject:", error);
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
    logger.error("Error in archiveProject:", error);
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
    logger.error("Error in getAllProjectsByWorkspace:", error);
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


    // 2. Extract project IDs
    const projectIds = memberships.map((m) => m.projectId);

    // 3. Find projects in this workspace that match those IDs
    const projects = await Project.find({
      _id: { $in: projectIds },
      workspace: workspaceId,
    })
      .select("name _id")
      .lean();

    return res.status(200).json({
      message: "User's projects in this workspace fetched successfully",
      projects,
    });
  } catch (error) {
    logger.error("Error in getMyProjectsByWorkspace:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getProjectById = async (req, res) => {
  try {
    // ✅ Validate projectId and workspaceId first (fail fast)
    const { projectId } = req.params;
    const { orgId } = req.orgUser;
    const userId = req.user.userId
    const { workspaceId } = req.query;
    const validatedProjectId = projectIdSchema.parse(projectId);

    const exists = await Workspace.exists({ _id: workspaceId, organization: orgId });
    if (!exists) {
      return res.status(404).json({ message: "project not part of current workspace" });
    }
    // ✅ Use Promise.all for parallel operations
    const [project] = await Promise.all([
      Project.findOne({
        _id: validatedProjectId,
        organization: orgId,
        workspace: workspaceId
      })
        .populate([
          { path: "createdBy", select: "email _id" },
          { path: "workspace", select: "name _id" },
          { path: "organization", select: "name _id" },
          { path: "boardId", select: "_id columns" }
        ])
        .lean(),

    ]);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // find the member of proejct 
    const member = await ProjectMember.findOne({
      projectId: validatedProjectId,
      userId,
      isRemoved: false,
    });

    // ✅ Check if the user is a member of the project
    if (!member) {
      return res.status(403).json({ message: "You are not a member of this project" });
    }
    // find role 
    const role = await RolePermission.findById(member.role).select("role permissions");
    const perm = member.hascustompermission ? member.permissionsOverride : role.permissions
    let payload = {
      permissions: perm,
      role: role.role,
      projectId: validatedProjectId,
      userId: userId
    }

    // generate proejct token 
    const projectToken = generateProjectToken(payload);
    setProjectCookie(res, projectToken);


    // ✅ Create new object to avoid modifying the lean result
    const responseData = {
      ...project
    };

    return res.status(200).json({
      message: "Project fetched successfully",
      project: responseData
    });

  } catch (error) {
    logger.error("❌ Error in getProjectById:", error);

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
    const { projectId } = req.params;
    const { workspaceId } = req.body;
    const { orgId } = req.orgUser;

    if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
      return res.status(400).json({ message: "Invalid workspace ID" });
    }

    // 1. Check workspace exists
    const exists = await Workspace.exists({ _id: workspaceId, orgId });
    if (!exists) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    // 2. Check project belongs to this workspace + org
    const project = await Project.findOne({
      _id: projectId,
      organization: orgId,
      workspace: workspaceId,
    });

    if (!project) {
      return res
        .status(404)
        .json({ message: "Project is not part of this workspace" });
    }

    // 3. Get all current project members
    const projectMembers = await ProjectMember.find({
      projectId,
      isRemoved: false,
      organizationId: orgId,
    }).select("userId");

  

    // 4. Get all workspace members
    const workspaceMembers = await Member.find({
      workspace: workspaceId,
      isRemoved: false,
      organizationId: orgId,
    })
      .select("_id userId")
      .populate("userId", "email");

    // 5. Filter out users already in project
    const assignableMembers = workspaceMembers
      .map((m) => ({
        mId: m._id,
        email: m.userId.email,
      }));

    return res.status(200).json({
      message: "Assignable project members fetched successfully",
      members: assignableMembers,
    });
  } catch (error) {
    logger.error("Error in getAssignableMembers:", error);
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
    logger.error("Error in getProjectAnalytics:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

