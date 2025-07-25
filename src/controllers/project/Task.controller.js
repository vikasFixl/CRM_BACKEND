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
import { Team } from "../../models/project/TeamModel.js";

export const createTask = async (req, res) => {
  try {
    /* ---------- 1. Validate body ---------- */
    const parsed = createTaskSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation error",
        errors: parsed.error.errors.map((e) => e.message),
      });
    }

    const {
      boardId,
      name,
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

    const { projectId } = req.params;
    const userId = req.user.userId;

    //  check if team exist or not 
    const team = await Team.findById(assignedTeamId);
    if (!team) {
      return res.status(404).json({ message: "team not found " })
    }

    /* ---------- 2. Parallel fetch + checks ---------- */
    const [project, board, member] = await Promise.all([
      Project.findById(projectId),
      Board.findOne({ _id: boardId, projectId }),
      ProjectMember.findOne({ projectId, userId }),
    ]);

    if (!project) return res.status(404).json({ message: "Project not found" });
    if (!board) return res.status(404).json({ message: "Board not found" });
    if (!member) return res.status(403).json({ message: "User not part of project" });

    /* ---------- 3. Duplicate task name ---------- */
    const dup = await Task.findOne({ name, projectId, boardId });
    if (dup) return res.status(400).json({ message: "Task name already exists" });
    /* ---------- 3a. Validate assigned team ---------- */
    if (assignedTeamId) {
      const team = await Team.findOne({ _id: assignedTeamId });
      if (!team || team.projectId.toString() != projectId) {
        return res.status(400).json({ message: "Invalid team for this project" });
      }
    }

    /* ---------- 4. Column validation ---------- */
    const column = board.columns.find((c) => c.key === status);
    if (!column) {
      const allowed = board.columns.map((c) => c.key).join(", ");
      return res.status(400).json({ message: `Status must be one of: ${allowed}` });
    }

    /* ---------- 5. Optional parent task ---------- */
    if (parentId) {
      if (!mongoose.isValidObjectId(parentId)) {
        return res.status(400).json({ message: "Invalid parentId" });
      }
      const parent = await Task.findById(parentId);
      if (!parent || String(parent.projectId) !== projectId) {
        return res.status(400).json({ message: "Invalid or cross-project parent" });
      }
    }
    //  check if task type is allowed or not 
    if (type !== "task" && type !== "bug") {
      return res.status(400).json({ message: "Invalid task type" });
    }

    /* ---------- 6. Create task ---------- */
    const task = await Task.create({
      projectId,
      name,
      description,
      type,
      status,
      priority,
      assigneeId,
      reporterId: req.user.userId,
      assignedTeamId,
      sprintId: project.type === "scrum" ? sprintId : undefined,
      epicId,
      parentId,
      columnId: column._id,
      columnOrder: column.order,
      boardId,
      dueDate,
      storyPoints,
      labels,
      watchers,
      customFields,
    });

    return res.status(201).json({ message: "Task created successfully", task });
  } catch (err) {
    console.error("createTask error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getAllTasks = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { teamId, boardId } = req.query;          // optional filter

    // Build base filter
    const filter = { projectId, isDeleted: false, boardId };
    if (teamId) {
      if (!mongoose.isValidObjectId(teamId)) {
        return res.status(400).json({ message: "Invalid teamId" });
      }
      filter.assignedTeamId = teamId;
    }
    // find the project 
    const pexist = await Project.findOne({ _id: projectId })
    if (!pexist) {
      return res.status(404).json({ message: "project not found " })
    }
    // Fetch & populate
    const tasks = await Task.find(filter)
      .populate({
        path: "assigneeId",
        populate: { path: "userId", select: "firstName email avatar" },
      })
      .populate("assignedTeamId", "name description _id")
      .populate("parentId", "name taskCode").sort({ createdAt: -1 });

    // Flatten assignee
    const cleanedTasks = tasks.map((t) => {
      const user = t.assigneeId?.userId;
      return {
        ...t.toObject(),
        assigneeId: user
          ? { firstName: user.firstName, email: user.email, avatar: user.avatar }
          : null,
      };
    });

    return res.status(200).json({
      message: "Tasks fetched successfully",
      totalTask: cleanedTasks.length,
      tasks: cleanedTasks,
    });
  } catch (error) {
    console.error("Error in getAllTasks:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const deleteTask = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { taskId, projectId } = req.params;
    const { teamId, boardId } = req.query;            // optional
    const userId = req.user.userId;

    /* ---------- basic param checks ---------- */
    if (!taskId || !projectId || !boardId) {
      return res.status(400).json({ message: "projectId, boardId and taskId are required" });
    }
    if (!mongoose.Types.ObjectId.isValid(taskId) ||
      !mongoose.Types.ObjectId.isValid(projectId) ||
      !mongoose.Types.ObjectId.isValid(boardId)) {
      return res.status(400).json({ message: "Invalid ID(s)" });
    }

    /* ---------- build task filter ---------- */
    const taskFilter = {
      _id: taskId,
      projectId,
      boardId,
      isDeleted: false,
    };
    // check if proejct is present 
    const pexit = await Project.findById(projectId);
    if (!pexit) {
      return res.status(404).json({ message: "proejct not found " })
    }
    /* ---------- optional team check ---------- */
    if (teamId) {
      if (!mongoose.Types.ObjectId.isValid(teamId)) {
        return res.status(400).json({ message: "Invalid teamId" });
      }
      // make sure the team exists and belongs to the same project
      const team = await Team.findOne({ _id: teamId, projectId }).session(session);
      if (!team) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ message: "Team not found or not in project" });
      }
      taskFilter.assignedTeamId = teamId;
    }

    /* ---------- fetch task ---------- */
    const task = await Task.findOne(taskFilter).session(session);
    if (!task) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Task not found" });
    }

    /* ---------- soft-delete sub-tasks ---------- */
    await Task.updateMany(
      { parentId: task._id, isDeleted: false },
      { $set: { isDeleted: true, deletedBy: userId, deletedAt: new Date() } },
      { session }
    );

    /* ---------- soft-delete main task ---------- */
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
  try {
    const { projectId, taskId } = req.params;
    const { boardId } = req.query;

    /* ---------- 1. Basic param validation ---------- */
    if (!taskId || !projectId) {
      return res.status(400).json({ message: "taskId and projectId are required" });
    }
    if (!mongoose.isValidObjectId(taskId) || !mongoose.isValidObjectId(projectId)) {
      return res.status(400).json({ message: "Invalid ID(s)" });
    }

    /* ---------- 2. Build sub-task filter ---------- */
    const filter = { parentId: taskId, projectId, isDeleted: false };

    /* boardId is mandatory for sub-tasks on a board */
    if (!boardId) {
      return res.status(400).json({ message: "boardId is required" });
    }
    if (!mongoose.isValidObjectId(boardId)) {
      return res.status(400).json({ message: "Invalid boardId" });
    }
    filter.boardId = boardId;

    /* ---------- 3. Fetch & populate ---------- */
    const subTasks = await Task.find(filter)
      .select("-__v -isDeleted") // slim payload
      .populate("parentId", "name taskCode")
      .sort({ createdAt: -1 })

    return res.status(200).json({
      message: "Subtasks fetched successfully",
      total: subTasks.length,
      tasks: subTasks,
    });
  } catch (error) {
    console.error("GetAllSubTasks error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getTaskById = async (req, res) => {
  try {
    const taskId = req.params.taskId;


    if (!taskId) {
      return res
        .status(400)
        .json({ message: "Task ID required" });
    }
    const task = await Task.findOne({ _id: taskId, isDeleted: false }).populate("projectId", "name _id").populate("assignedTeamId", "name _id")
    // console.log(task)
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
    if (!taskId) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Task ID are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Invalid Task ID or Project ID" });
    }

    const existproejct = await Project.findById(projectId)
    if (!existproejct) {
      return res.status(404).json({ message: "proejct not found " })
    };
    const existtask = await Task.findById(taskId)
    if (!existtask) {
      return res.status(404).json({ message: "task not found " })
    };
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
    console.log("parseddata", parsed.data);

    // Fetch task with populated board and workflow (inside board) 
    const task = await Task.findOne({ _id: taskId, isDeleted: false, projectId })
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
      return res.status(404).json({ message: "Task not found or task not part of project" });
    }

    console.log("task at ", task)
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
      { _id: taskId },
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
    const { taskId, projectId } = req.params;
    const { boardId, from, to } = req.body;

    // Validate IDs
    if (
      !mongoose.Types.ObjectId.isValid(boardId) ||
      !mongoose.Types.ObjectId.isValid(taskId) ||
      !mongoose.Types.ObjectId.isValid(projectId)
    ) {
      return res.status(400).json({ message: "Invalid board, task, or project ID" });
    }

    // Check if project exists
    const project = await Project.findById(projectId).session(session);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Fetch board and its workflow
    const board = await Board.findById(boardId)
      .populate("workflow")
      .session(session);

    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }

    const fromColumn = board.columns.find((col) => col.order === from);
    const toColumn = board.columns.find((col) => col.order === to);

    if (!fromColumn || !toColumn) {
      return res.status(400).json({
        message: "Invalid source or destination column",
        from,
        to,
        availableColumns: board.columns.map((col) => ({
          order: col.order,
          name: col.name,
        })),
      });
    }

    // Check if transition is allowed
    const transition = board.workflow.transitions.find(
      (t) => t.fromOrder === from && t.toOrder === to
    );

    if (!transition) {
      return res.status(403).json({
        message: `Transition from '${fromColumn.name}' to '${toColumn.name}' is not allowed`,
        allowedTransitions: board.workflow.transitions.map((t) => ({
          from: t.fromOrder,
          to: t.toOrder,
          name: t.name,
          action: t.action,
        })),
      });
    }

    // Get task
    const task = await Task.findById(taskId).session(session);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (task.columnOrder !== from) {
      return res.status(409).json({
        message: `Task is not currently in the '${fromColumn.name}' state`,
        currentColumnOrder: task.columnOrder,
      });
    }

    // Update task state
    task.columnOrder = to;
    task.status = toColumn.key;
    task.history = task.history || [];

    task.history.push({
      changedBy: req.user.userId,
      changedAt: new Date(),
      fromStatus: fromColumn.key,
      toStatus: toColumn.key,
      transition: transition.name,
    });

    await task.save({ session });

    // Log the transition
    await AuditLog.create(
      [
        {
          taskId: task._id,
          projectId: task.projectId,
          userId: req.user.userId,
          action: "TASK_MOVED",
          description: `Task moved via transition '${transition.name}' from '${fromColumn.name}' to '${toColumn.name}'`,
          metadata: {
            fromColumn: fromColumn.name,
            toColumn: toColumn.name,
            transition: transition.name,
          },
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      message: "Task moved successfully",
      task: {
        id: task._id,
        status: task.status,
        columnOrder: task.columnOrder,
        transition: transition.name,
      },
      transition: {
        name: transition.name,
        action: transition.action,
        fromState: fromColumn.name,
        toState: toColumn.name,
      },
    });
  } catch (error) {
    console.error("Error moving task:", error);
    await session.abortTransaction().catch(() => { });
    session.endSession().catch(() => { });
    return res.status(500).json({
      message: "Internal server error while moving task",
      error: error.message,
    });
  }
};


export const getTasksByBoardColumn = async (req, res) => {
  try {
    const boardId = req.params.boardId;

    // Validate inputs
    if (!boardId) {
      return res.status(400).json({ message: "boardId required" });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(boardId)) {
      return res.status(400).json({ message: "Invalid boardId format" });
    }

    // Fetch board and tasks in parallel
    const [board, tasksRaw] = await Promise.all([
      Board.findOne({ _id: boardId, isDeleted: false }).lean(),
      Task.find({ boardId, isDeleted: false })
        .select("columnOrder summary _id status priority name taskCode")
        .populate({
          path: "assigneeId",
          select: "userId", // only fetch userId from assignee object
          populate: {
            path: "userId",
            select: "firstName email avatar", // only these fields from user
          }
        })
        .lean()
    ]);

    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }

    console.log("boaard", board)
    console.log("task raw", tasksRaw);

    // Create column structure
    const columns = (board.columns || [])
      .sort((a, b) => a.order - b.order)
      .map(col => ({
        id: col._id,
        name: col.name,
        order: col.order,
        key: col.key,
        tasks: [] // Initialize empty task array
      }));

    // Create column lookup
    const columnMap = new Map();
    columns.forEach(col => columnMap.set(col.order, col));


    const tasks = tasksRaw.map(task => {
      const user = task.assigneeId?.userId;

      return {
        _id: task._id,
        name: task.name,
        priority: task.priority,
        status: task.status,
        columnOrder: task.columnOrder,
        taskCode: task.taskCode,
        summary: task.summary,
        assignee: user
          ? {
            name: user.firstName,
            email: user.email,
            avatar: user.avatar?.url,
          }
          : null
      };
    });

    // Group tasks into columns
    tasks.forEach(task => {
      if (columnMap.has(task.columnOrder)) {
        columnMap.get(task.columnOrder).tasks.push(task);
      }
    });

    return res.status(200).json({
      message: "Tasks grouped by board columns",
      totalTasks: tasks.length,
      columns
    });

  } catch (error) {
    console.error("Error in getTasksByBoardColumn:", error);
    return res.status(500).json({
      message: "Failed to fetch tasks",
      error: error.message
    });
  }
};

