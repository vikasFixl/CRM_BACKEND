import { Task } from "../../models/project/TaskModel.js";
import { Project } from "../../models/project/ProjectModel.js";
import { Board } from "../../models/project/BoardMode.js";
import mongoose from "mongoose";
import { createTaskSchema } from "../../validations/task/taskvalidation.js";

export const createTask = async (req, res) => {
  try {
    // 1. Validate request body
    const parsed = createTaskSchema.safeParse(req.body);
    if (!parsed.success) {
      console.log("Zod error", parsed.error.format());
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
      assignedTeamId,
      sprintId,
      epicId,
      parentId,
      dueDate,
      storyPoints,
      labels,
      watchers,
      customFields,
    } = parsed.data;

    // 2. Check if project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // 3. Validate task type
    const allowedTypes = ["task", "bug", "story", "epic", "spike"];
    if (!allowedTypes.includes(type)) {
      return res.status(400).json({
        message: `Invalid task type. Allowed: ${allowedTypes.join(", ")}`,
      });
    }

    // 4. Handle parent task validation
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

    // 5. Find board and validate status
    const board = await Board.findOne({ projectId });
    if (!board) {
      return res.status(404).json({ message: "Board not found for the project" });
    }

    // 6. Match status with column
    const column = board.columns.find((col) => col.key === status);
    if (!column) {
      const allowedStatus = board.columns.map((c) => c.key);
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${allowedStatus.join(", ")}`,
      });
    }

    // 7. Generate task key
    const count = await Task.countDocuments({ projectId });
    const key = `${project.slug}-task-${count + 1}`;

    // 8. Create task
    const task = new Task({
      projectId,
      key,
      summary,
      description,
      type,
      status,
      priority,
      assigneeId,
      reporterId: req.user.Id,
      assignedTeamId,
      sprintId: project.type === "scrum" ? sprintId : undefined,
      epicId,
      parentId,
      columnOrder: column.order,
      columnId: column._id,
      dueDate,
      storyPoints,
      labels,
      watchers,
      customFields,
    });

    await task.save();

    return res.status(201).json({
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    console.error("Error in createTask:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ projectId: req.params.projectId });
    return res.status(200).json({ tasks , message: "Tasks fetched successfully" });
  } catch (error) {
    console.error("Error in getAllTasks:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
