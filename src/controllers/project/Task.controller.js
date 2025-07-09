import { Task } from "../../models/project/TaskModel.js";
import { Project } from "../../models/project/ProjectModel.js";
import { Board } from "../../models/project/BoardMode.js";
import mongoose from "mongoose";
import { ProjectMember } from "../../models/project/projectMemberModel.js";
import {
  createTaskSchema,
  updateTaskSchema,
} from "../../validations/task/taskvalidation.js";
import { AuditLog } from "../../models/project/auditLogModel.js";

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
    const column = board.columns.find((col) => col.name === status);
    if (!column) {
      const allowedStatus = board.columns.map((c) => c.key);
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${allowedStatus.join(", ")}`,
      });
    }



    // 8. Create task
    const task = new Task({
      projectId,
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
      boardId: board._id,
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
    const tasks = await Task.find({ projectId: req.params.projectId, isDeleted: false });
    return res
      .status(200)
      .json({ tasks, message: "Tasks fetched successfully" });
  } catch (error) {
    console.error("Error in getAllTasks:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
export const deleteTask = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { projectId, taskId } = req.params;
    const userId = req.user.userId;

    if (!projectId || !taskId) {
      return res.status(400).json({ message: "Project ID and Task ID are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(projectId) || !mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ message: "Invalid Project ID or Task ID" });
    }

    const project = await Project.findOne({ _id: projectId, isDeleted: false }).session(session);
    if (!project) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Project does not exist" });
    }

    const task = await Task.findOne({ _id: taskId, projectId, isDeleted: false }).session(session);
    if (!task) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Task not found" });
    }

    // 🔁 Soft delete all subtasks recursively
    await Task.updateMany(
      { parentId: task._id, isDeleted: false },
      { $set: { isDeleted: true, deletedBy: userId, deletedAt: new Date() } },
      { session }
    );

    // 🗑️ Soft delete the main task
    task.isDeleted = true;
    task.deletedBy = userId;
    task.deletedAt = new Date();
    await task.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      message: "Task and its subtasks soft deleted successfully",
      success: true,
      code: 200,
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
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
    const tasks = await Task.find({ parentId: taskId, projectId, isDeleted: false });
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
    const task = await Task.findOne({ _id: taskId, projectId, isDeleted: false })
    console.log(task)
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
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { taskId, projectId } = req.params;
    const userId = req.user.userId;

    // Validate IDs
    if (!taskId || !projectId) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Task ID and Project ID are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(taskId) || !mongoose.Types.ObjectId.isValid(projectId)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Invalid Task ID or Project ID" });
    }

    // Validate request body
    const parsed = updateTaskSchema.safeParse(req.body);
    if (!parsed.success) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        message: "Validation error",
        errors: parsed.error.errors.map((e) => e.message),
      });
    }

    const { status, ...updateData } = parsed.data;

    // Fetch task with populated board and workflow (inside board) 
    const task = await Task.findOne({ _id: taskId, projectId, isDeleted: false })
      .populate({
        path: 'boardId',
        populate: {
          path: 'workflow',
          model: 'Workflow'
        }
      })
      .session(session);

    if (!task) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Task not found" });
    }

    // Handle status update if present in request
    if (status !== undefined) {
      if (!task.boardId) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: "Task is not associated with a board" });
      }

      // Validate status against board columns
      const targetColumn = task.boardId.columns.find(col => col.key === status);
      if (!targetColumn) {
        const allowedStatuses = task.boardId.columns.map(c => c.key);
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          message: `Invalid status. Allowed values: ${allowedStatuses.join(', ')}`,
          allowedStatuses
        });
      }

      // Check workflow transitions if status is changing
      if (task.status !== status) {
        const currentColumn = task.boardId.columns.find(col => col.key === task.status);

        // Only validate transition if we're coming from a valid state
        if (currentColumn) {
          // Safely check for workflow and transitions
          if (!task.boardId.workflow?.transitions) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
              message: "Workflow transitions not defined for this board"
            });
          }

          const isTransitionAllowed = task.boardId.workflow.transitions.some(
            transition =>
              transition.fromOrder === currentColumn.order &&
              transition.toOrder === targetColumn.order
          );

          if (!isTransitionAllowed) {
            const allowedTransitions = task.boardId.workflow.transitions
              .filter(t => t.fromOrder === currentColumn.order)
              .map(t => ({
                to: task.boardId.columns.find(c => c.order === t.toOrder)?.key,
                name: t.name
              }));

            await session.abortTransaction();
            session.endSession();
            return res.status(403).json({
              message: `Transition from '${task.status}' to '${status}' is not allowed`,
              currentStatus: task.status,
              allowedTransitions
            });
          }
        }

        // Update history if status changed
        updateData.history = [
          ...(task.history || []),
          {
            changedBy: userId,
            changedAt: new Date(),
            fromStatus: task.status,
            toStatus: status,
            description: `Status changed via update`
          }
        ];

        // Update both status and column order
        updateData.status = status;
        updateData.columnOrder = targetColumn.order;
      }
    }

    // Perform the update
    const updatedTask = await Task.findOneAndUpdate(
      { _id: taskId, projectId },
      { $set: updateData },
      { new: true, session }
    );

    // Create audit log
    if (Object.keys(updateData).length > 0) {
      await AuditLog.create([{
        taskId: updatedTask._id,
        projectId: updatedTask.projectId,
        userId: userId,
        action: "TASK_UPDATED",
        description: `Task ${status !== undefined ? 'status and ' : ''}fields updated`,
        metadata: {
          updatedFields: Object.keys(updateData),
          ...(status !== undefined && {
            statusChange: {
              from: task.status,
              to: status
            }
          })
        }
      }], { session });
    }

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      message: "Task updated successfully",
      task: updatedTask,
      ...(status !== undefined && {
        statusTransition: {
          from: task.status,
          to: status,
          valid: true
        }
      })
    });

  } catch (error) {
    console.error("Error in updateTask:", error);
    await session.abortTransaction().catch(err => console.error('Abort transaction error:', err));
    session.endSession().catch(err => console.error('Session end error:', err));
    return res.status(500).json({
      message: "Failed to update task",
      error: error.message,
      ...(error instanceof TypeError && error.message.includes('some') && {
        hint: "Workflow transitions might not be properly defined"
      })
    });
  }
};


export const reorderTasks = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { boardId } = req.params;
    const { taskId, from, to } = req.body;

    // Validate IDs
    if (
      !mongoose.Types.ObjectId.isValid(boardId) ||
      !mongoose.Types.ObjectId.isValid(taskId)
    ) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Invalid board or task ID" });
    }

    // Fetch board with workflow
    const board = await Board.findById(boardId)
      .populate("workflow")
      .session(session);

    if (!board) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Board not found" });
    }

    // Validate columns
    const fromColumn = board.columns.find((col) => col.order === from);
    const toColumn = board.columns.find((col) => col.order === to);

    if (!fromColumn || !toColumn) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        message: `Invalid column orders. from='${from}', to='${to}'`,
        availableColumns: board.columns.map(c => ({ order: c.order, name: c.name }))
      });
    }

    // Find matching transition
    const transition = board.workflow.transitions.find(
      (t) => t.fromOrder === from && t.toOrder === to
    );

    if (!transition) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({
        message: `Transition from '${fromColumn.name}' to '${toColumn.name}' is not allowed`,
        allowedTransitions: board.workflow.transitions.map(t => ({
          from: t.fromOrder,
          to: t.toOrder,
          name: t.name,
          action: t.action
        }))
      });
    }

    // Find and update task
    const task = await Task.findById(taskId).session(session);
    if (!task) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Task not found" });
    }

    // Update task based on transition
    task.columnOrder = to;
    task.status = toColumn.key; // Using column key as status
    task.history = task.history || [];
    task.history.push({
      changedBy: req.user.userId,
      changedAt: new Date(),
      fromStatus: fromColumn.key,
      toStatus: toColumn.key,
      transition: transition.name
    });

    await task.save({ session });

    // Create audit log
    await AuditLog.create([{
      taskId: task._id,
      projectId: task.projectId,
      userId: req.user.userId,
      action: "TASK_MOVED",
      description: `Task moved via transition '${transition.name}' from '${fromColumn.name}' to '${toColumn.name}'`,
      metadata: {
        fromColumn: fromColumn.name,
        toColumn: toColumn.name,
        transition: transition.name
      }
    }], { session });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      message: `Task moved succesfully `,
      task: {
        id: task._id,
        status: task.status,
        columnOrder: task.columnOrder,
        transition: transition.name
      },
      transition: {
        name: transition.name,
        action: transition.action,
        fromState: fromColumn.name,
        toState: toColumn.name
      }
    });
  } catch (error) {
    console.error("Error moving task:", error);
    await session.abortTransaction().catch(() => { });
    session.endSession().catch(() => { });
    return res.status(500).json({
      message: "Failed to move task",
      error: error.message,
    });
  }
};

export const getTasksByBoardColumn = async (req, res) => {
  try {
    const { boardId } = req.body;
    const { projectId } = req.params;

    // Validate inputs
    if (!projectId || !boardId) {
      return res.status(400).json({
        message: "Both projectId (params) and boardId (body) are required",
      });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(projectId) || !mongoose.Types.ObjectId.isValid(boardId)) {
      return res.status(400).json({ message: "Invalid projectId or boardId format" });
    }

    // Fetch board and tasks in parallel
    const [board, tasks] = await Promise.all([
      Board.findOne({ _id: boardId, projectId }).lean(),
      Task.find({ boardId, isDeleted: false }).select("columnOrder summary _id status priority").lean()
    ]);

    if (!board) {
      return res.status(404).json({ message: "Board not found for the given project" });
    }

    // Create column structure with empty task arrays
    const columns = (board.columns || [])
      .sort((a, b) => a.order - b.order)
      .map(col => ({
        id: col._id,
        name: col.name,
        order: col.order,
        key: col.key,
        tasks: [] // Initialize empty task array
      }));

    // Create a lookup map for columns by order
    const columnMap = new Map();
    columns.forEach(col => columnMap.set(col.order, col));

    // Group tasks by column
    tasks.forEach(task => {
      if (columnMap.has(task.columnOrder)) {
        columnMap.get(task.columnOrder).tasks.push(task);
      }
    });

    return res.status(200).json({
      message: "Tasks grouped by board columns",
      columns,
      totalTasks: tasks.length
    });

  } catch (error) {
    console.error("Error in getTasksByBoardColumn:", error);
    return res.status(500).json({
      message: "Failed to fetch tasks",
      error: error.message
    });
  }
};
