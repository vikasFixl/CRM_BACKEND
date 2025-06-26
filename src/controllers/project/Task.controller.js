import { Task } from "../../models/project/TaskModel.js";
import { Project } from "../../models/project/ProjectModel.js";
import { Board } from "../../models/project/BoardMode.js";
import mongoose from "mongoose";
import { createTaskSchema } from "../../validations/task/taskvalidation.js";

export const createTask = async (req, res) => {
  try {
    const parsed = createTaskSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation error",
        errors: parsed.error.errors.map((e) => e.message),
      });
    }
    const {
      projectId,
      summary,
      description,
      type,
      status,
      priority,
      assigneeId,
      reporterId,
      assignedTeamId,
      sprintId,
      epicId,
      parentId,
      startDate,
      dueDate,
      storyPoints,
      labels,
      watchers,
      customFields,
    } = parsed.data;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    console.log("project", project);
    // Validate type
    const allowedTypes = ["task", "bug", "story", "epic", "spike"];
    if (!allowedTypes.includes(type)) {
      return res.status(400).json({
        message: `Invalid task type. Allowed: ${allowedTypes.join(", ")}`,
      });
    }

    // If parentId exists, verify it and prevent circular parent reference
    if (parentId) {
      if (!mongoose.Types.ObjectId.isValid(parentId)) {
        return res.status(400).json({ message: "Invalid parentId" });
      }
      const parentTask = await Task.findById(parentId);
      if (!parentTask || String(parentTask.projectId) !== String(projectId)) {
        return res
          .status(400)
          .json({ message: "Invalid or cross-project parent task" });
      }
    }

    // Get board and verify status
    const board = await Board.findOne({ projectId });
    if (!board) {
      return res
        .status(404)
        .json({ message: "Board not found for the project" });
    }

    const allowedStatus = board.columns.map((c) => c.stateKey);
    console.log("allowedStatus", allowedStatus);
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${allowedStatus.join(", ")}`,
      });
    }

    // Determine board type (Kanban or Scrum)
    const isScrum =  project.templateType=== "scrum";
    const isKanban = board.templateType === "kanban";

    // Auto-generate unique task key: e.g., "PROJKEY-1"
    const taskCount = await Task.countDocuments({ projectId });
    const key = `${project.key}-${taskCount + 1}`;

    // Construct and save task
    const task = new Task({
      projectId,
      key,
      summary,
      description,
      type,
      status,
      priority,
      assigneeId,
      reporterId,
      assignedTeamId,
      sprintId: isScrum ? sprintId : undefined, // only if Scrum
      epicId,
      parentId,
      startDate,
      dueDate,
      storyPoints,
      labels,
      watchers,
      attachments,
      customFields,
    });

    await task.save();
    return res.status(201).json({ message: "Task created successfully", task });
  } catch (error) {
    console.error("Error in createTask:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
