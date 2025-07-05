import { Task } from "../../models/project/TaskModel.js";
import { Project } from "../../models/project/ProjectModel.js";
import { Board } from "../../models/project/BoardMode.js";
import mongoose from "mongoose";
import { ProjectMember } from "../../models/project/projectMemberModel.js";
import {
  createTaskSchema,
  updateTaskSchema,
} from "../../validations/task/taskvalidation.js";

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
      return res
        .status(404)
        .json({ message: "Board not found for the project" });
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
    const key = `task-${count + 1}`;

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
    return res
      .status(200)
      .json({ tasks, message: "Tasks fetched successfully" });
  } catch (error) {
    console.error("Error in getAllTasks:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
export const deleteTask = async (req, res) => {
  try {
    const { projectId, taskId } = req.params;

    if (!projectId || !taskId) {
      return res
        .status(400)
        .json({ message: "Project ID and Task ID are required" });
    }

    const project = await Project.findOne({ _id: projectId });
    if (!project) {
      return res.status(404).json({ message: "Project does not exist" });
    }

    const task = await Task.findOne({ _id: taskId, projectId });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // 🔁 Recursive deletion of all nested subtasks
    await Task.deleteMany({ parentId: task._id });

    // 🗑️ Delete the task
    await Task.deleteOne({ _id: task._id });

    return res.status(200).json({
      message: "Task and all its subtasks deleted successfully",
      success: true,
      code: 200,
    });
  } catch (error) {
    console.error("Error deleting task:", error);
    return res.status(500).json({ message: "Internal server error", error });
  }
};

export const GetAllSubTasks = async (req, res) => {
  const taskId = req.params.taskId;
  const projectId = req.params.projectId;

  if (!taskId || !projectId) {
    return res
      .status(400)
      .json({ message: "Task ID and Project ID are required" });
  }
  try {
    const tasks = await Task.find({ parentId: taskId, projectId });
    if (!tasks) {
      return res.status(404).json({ message: "Subtasks not found", data: [] });
    }
    return res
      .status(200)
      .json({ tasks, message: "Subtasks fetched successfully" });
  } catch (error) {
    console.error("Error in GetAllSubTasks:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getTaskById = async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const projectId = req.params.projectId;

    if (!taskId || !projectId) {
      return res
        .status(400)
        .json({ message: "Task ID and Project ID are required" });
    }
    const task = await Task.findOne({ _id: taskId, projectId }).populate(
      "assigneeId"
    );
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    return res.status(200).json({ task, message: "Task fetched successfully" });
  } catch (error) {
    console.error("Error in getTaskById:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { taskId, projectId } = req.params;

    // Validate IDs first
    if (!taskId || !projectId) {
      return res
        .status(400)
        .json({ message: "Task ID and Project ID are required" });
    }

    if (
      !mongoose.Types.ObjectId.isValid(taskId) ||
      !mongoose.Types.ObjectId.isValid(projectId)
    ) {
      return res.status(400).json({ message: "Invalid Task ID or Project ID" });
    }

    // Validate body
    const parsed = updateTaskSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation error",
        errors: parsed.error.errors.map((e) => e.message),
      });
    }

    // Update task
    const updatedTask = await Task.findOneAndUpdate(
      { _id: taskId, projectId },
      { $set: parsed.data },
      { new: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    res
      .status(200)
      .json({ message: "Task updated successfully", task: updatedTask });
  } catch (error) {
    console.error("Error in updateTask:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const reorderTasks = async (req, res) => {
  try {
    const { boardId } = req.params;
    const { taskId, order } = req.body;

    // Validate IDs
    if (
      !mongoose.Types.ObjectId.isValid(boardId) ||
      !mongoose.Types.ObjectId.isValid(taskId)
    ) {
      return res.status(400).json({ message: "Invalid board or task ID" });
    }

    // 1. Find the board
    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }
    console.log("board", board);
    const col = board.columns.find((col) => col.order == order);
    console.log("col", col);

    // 2. Check if the column exists in the board
    const column = board.columns.find((col) => col.order === order);

    if (!column) {
      return res.status(400).json({
        message: `Invalid column order: '${order}' not found in board`,
      });
    }

    // 3. Update the task’s column and order
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.columnOrder = order; // the task should have this field
    // must be maintained in schema
    await task.save();
    return res.status(200).json({ message: "Task moved successfully", task });
  } catch (error) {
    console.error("Error moving task:", error);
    return res
      .status(500)
      .json({ message: "Failed to move task", error: error.message });
  }
};

export const getTasksByBoardColumn = async (req, res) => {
  try {
    const { boardId } = req.body;
    const { projectId } = req.params;

    if (!projectId || !boardId) {
      return res.status(400).json({
        message: "Both projectId (params) and boardId (body) are required",
      });
    }

    const board = await Board.findOne({ _id: boardId, projectId });
    if (!board) {
      return res
        .status(404)
        .json({ message: "No board found for the given project" });
    }

    const boardColumns = board.columns || [];

    const columnMap = {};
    boardColumns.forEach((col) => {
      columnMap[col.order] = {
        name: col.name,
        order: col.order,
        tasks: [],
      };
    });

    const tasks = await Task.find({ boardId }).select("columnOrder summary");

    tasks.forEach((task) => {
      if (typeof task.columnOrder === "number" && columnMap[task.columnOrder]) {
        columnMap[task.columnOrder].tasks.push(task);
      }
    });

    res.status(200).json({
      message: "Tasks grouped by board columns",

      columns: Object.values(columnMap).sort((a, b) => a.order - b.order),
    });
  } catch (error) {
    console.error("Error in getTasksByBoardColumn:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
