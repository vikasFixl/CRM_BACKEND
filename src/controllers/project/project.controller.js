import { Project } from "../../models/project/ProjectModel.js";
import { Board } from "../../models/project/BoardMode.js";
import { Workflow } from "../../models/project/WorkflowModel.js";
import { AutomationRule } from "../../models/project/automationModel.js";
import { ProjectTemplate } from "../../models/project/ProjectTemplateModel.js";
import { ProjectMember } from "../../models/project/projectMemberModel.js";
import { AuditLog } from "../../models/project/auditLogModel.js";
import { Workspace } from "../../models/project/WorkspaceModel.js";
import mongoose from "mongoose";

export const createProject = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const userId = req.user.userId;
    const orgId = req.orgUser.orgId;

    const { workspaceId } = req.params;
    const { name, templateId, description } = req.body;

    if (!name || !workspaceId || !templateId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const template = await ProjectTemplate.findById(templateId);
    if (!template) {
      return res.status(404).json({ message: "Project template not found" });
    }
    console.log("template", template);

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    const newProject = await Project.create([{
      name,
      description: description || template.description || "",
      workspace: workspace._id,
      type: template.boardType,
      organization: orgId,
      boardType: template.boardType,
      createdBy: userId,
    }], { session });

    const project = newProject[0];

    await Board.create([{
      projectId: project._id,
      name: `${name} Board`,
      type: template.boardType,
      columns: template.columns || ["To Do", "In Progress", "Done"],
    }], { session });

    await Workflow.create([{
      projectId: project._id,
      name: `${name} Workflow`,
      states: template.workflow?.states || [
        { key: "todo", name: "To Do", category: "todo", color: "#D3D3D3", order: 1 },
        { key: "in_progress", name: "In Progress", category: "in_progress", color: "#87CEEB", order: 2 },
        { key: "done", name: "Done", category: "done", color: "#90EE90", order: 3 },
      ],
      transitions: template.workflow?.transitions || [
        { from: "todo", to: "in_progress" },
        { from: "in_progress", to: "done" },
      ],
    }], { session });


    if(template.automationRules){
        template.automationRules.forEach(async (rule) => {
          await AutomationRule.create([{
            projectId: project._id,
            name: rule.name,
            description: rule.description,
            trigger: rule.trigger,
            conditions: rule.conditions,
            actions: rule.actions,
          }], { session });
        })
    }

    await ProjectMember.create([{
      projectId: project._id,
      userId,
      role: "admin",
      addedBy: userId,
    }], { session });

    await AuditLog.create([{
      projectId: project._id,
      userId,
      action: "CREATE_PROJECT",
      description: `Project '${name}' created with template '${template.name}'`,
    }], { session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: "Project created successfully",
      project,
    });

  } catch (error) {
    console.error("Error in createProject:", error);
    await session.abortTransaction(); // 🛑 Make sure to abort
    session.endSession();
    res.status(500).json({
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
  try {
    // TODO: Soft delete a project
    res.status(200).json({ message: "deleteProject route hit" });
  } catch (error) {
    console.error("Error in deleteProject:", error);
    res.status(500).json({ message: "Internal server error" });
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
    // TODO: Fetch all projects under a workspace
    res.status(200).json({ message: "getAllProjectsByWorkspace route hit" });
  } catch (error) {
    console.error("Error in getAllProjectsByWorkspace:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getProjectById = async (req, res) => {
  try {
    // TODO: Fetch project by its ID
    res.status(200).json({ message: "getProjectById route hit" });
  } catch (error) {
    console.error("Error in getProjectById:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
