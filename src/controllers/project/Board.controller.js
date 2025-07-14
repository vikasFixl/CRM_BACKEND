import { Board } from "../../models/project/BoardMode.js";
import { Workflow } from "../../models/project/WorkflowModel.js";
import { ProjectTemplate } from "../../models/project/ProjectTemplateModel.js";
import mongoose from "mongoose";
import { Task } from "../../models/project/TaskModel.js";

// 🔹 Create a new board (with optional template)
export const createBoard = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { projectId, teamId, templateId } = req.body;
    const userId = req.user.userId;

    // Validate inputs
    if (!projectId && !teamId) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        error: "Either projectId or teamId must be provided"
      });
    }

    if (templateId && !mongoose.Types.ObjectId.isValid(templateId)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: "Invalid template ID" });
    }

    let boardColumns = [];
    let workflowData = null;

    // Handle template-based board creation
    if (templateId) {
      const template = await ProjectTemplate.findById(templateId).session(session);
      if (!template) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ error: "Template not found" });
      }

      // Map template columns to board columns
      boardColumns = template.boardColumns.map(col => ({
        name: col.name,
        key: col.key,
        order: col.order,
        color: col.color,
        category: col.category
      }));

      // Create workflow from template
      const [workflow] = await Workflow.create([{
        projectId: projectId || null,
        teamId: teamId || null,
        name: `${template.name} Workflow`,
        states: template.workflow.states,
        transitions: template.workflow.transitions,
        createdBy: userId
      }], { session });

      workflowData = workflow._id;
    }

    // Create the board
    const [board] = await Board.create([{
      projectId: projectId || null,
      teamId: teamId || null,
      name: req.body.name || "New Board",
      type: req.body.type || "kanban",
      columns: boardColumns,
      workflow: workflowData,
      createdBy: userId,
      isProjectDefault: !!projectId,
      isTeamDefault: !!teamId
    }], { session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      board,
      ...(workflowData && { workflowId: workflowData })
    });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};


// get all board by project will be used when we make team model 
// export const getAllBoard = async (req, res) => {
//   try {
//     const boards = await Board.find(
//       { projectId: req.params.projectId, isDeleted: false },
//       "_id name isProjectDefault teamId type columns deletable"
//     ).populate({
//       path: 'teamId',
//       select: '_id name' // Only include team _id and name
//     }).lean(); // Convert to plain JS object

//     // Simplify the boards data before sending
//     const simplifiedBoards = boards.map(board => ({
//       _id: board._id,
//       name: board.name,
//       type: board.type,
//       projectId: req.params.projectId,
//       teamId: board.teamId ? { 
//         _id: board.teamId._id, 
//         name: board.teamId.name 
//       } : null,
//       isProjectDefault: board.isProjectDefault,
//       deletable: board.deletable,
//       columns: board.columns.map(column => ({
//         _id: column._id,
//         name: column.name,
//         order: column.order,
//         key: column.key
//       }))
//     }));

//     res.status(200).json({
//       success: true,
//       total: simplifiedBoards.length,
//       boards: simplifiedBoards,
//     });
//   } catch (err) {
//     res.status(400).json({
//       success: false,
//       error: err.message,
//     });
//   }
// };

export const getAllBoard = async (req, res) => {
  try {
    const boards = await Board.find(
      { projectId: req.params.projectId, isDeleted: false },
      "_id name isProjectDefault teamId type columns deletable"
    ).lean();

    // Simplify the boards data before sending
    const simplifiedBoards = boards.map(board => ({
      _id: board._id,
      name: board.name,
      type: board.type,
      projectId: req.params.projectId,
      teamId: board.teamId, // keep as is since we can't populate
      isProjectDefault: board.isProjectDefault,
      deletable: board.deletable,
      columns: board.columns.map(column => ({
        _id: column._id,
        name: column.name,
        order: column.order,
        key: column.key
      }))
    }));

    res.status(200).json({
      success: true,
      total: simplifiedBoards.length,
      boards: simplifiedBoards,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
};


export const deleteBoard = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user.userId;
    const { boardId } = req.params;

    const board = await Board.findById(boardId).session(session);

    if (!board || board.isDeleted) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Board not found or already deleted" });
    }

    if (!board.teamId) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({
        message: "Only team-assigned boards can be deleted"
      });
    }

    if (!board.deletable) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({
        message: "This board cannot be deleted (protected)"
      });
    }

    // Soft delete associated tasks
    await Task.updateMany(
      { boardId: board._id, isDeleted: { $ne: true } },
      {
        $set: {
          isDeleted: true,
          deletedBy: userId,
          deletedAt: new Date()
        }
      },
      { session }
    );

    // Soft delete the board
    board.isDeleted = true;
    board.deletedBy = userId;

    await board.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({ success: true, message: "Board and tasks deleted successfully" });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ error: error.message });
  }
};

export const getBoardById = async (req, res) => {
  try {
    const { boardId } = req.params;
    const { teamId } = req.query; // Optional teamId passed as query parameter

    // Validate boardId
    if (!mongoose.Types.ObjectId.isValid(boardId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid boardId format'
      });
    }

    // Build query condition
    const queryConditions = {
      _id: boardId,
      isDeleted: false
    };

    // Add teamId to query if provided
    if (teamId) {
      if (!mongoose.Types.ObjectId.isValid(teamId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid teamId format'
        });
      }
      queryConditions.teamId = teamId;
    }

    // Fetch board with optional team validation
    const board = await Board.findOne(queryConditions)
      .select('_id name type columns teamId isProjectDefault deletable')
      .populate({
        path: 'projectId',
        select: '_id name',
        match: { isDeleted: false } // Only populate if team exists and not deleted
      })
      .lean();

    if (!board) {
      return res.status(404).json({
        success: false,
        error: teamId ? 'Board not found in specified team' : 'Board not found'
      });
    }

    // Fetch tasks (common for both cases)
    const tasks = await Task.find({ boardId, isDeleted: false })
      .select('_id title description columnKey priority dueDate labels assignees createdAt')
      .populate({
        path: 'assigneeId',
        select: '_id name avatar'
      })
      .populate({
        path: 'labels',
        select: '_id name color'
      })
      .sort({ createdAt: -1 })
      .lean();

    // Organize tasks by column
    const tasksByColumn = tasks.reduce((acc, task) => {
      acc[task.columnKey] = acc[task.columnKey] || [];
      acc[task.columnKey].push(task);
      return acc;
    }, {});

    const columnsWithTasks = board.columns.map(column => ({
      _id: column._id,
      name: column.name,
      order: column.order,
      key: column.key,
      tasks: tasksByColumn[column.key] || []
    }));

    res.status(200).json({
      success: true,
      board: {
        ...board,
        columns: columnsWithTasks,
        totalTasks: tasks.length
      }
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};


// 🔹 Add column (with workflow state sync)
export const addColumn = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { boardId } = req.params;
    const { name, projectId, teamId } = req.body;

    // Validate inputs
    if (!name || typeof name !== "string" || name.trim() === "") {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: "Column name is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(boardId)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: "Invalid board ID" });
    }

    // Find board
    const board = await Board.findOne({
      _id: boardId,
      $or: [{ projectId }, { teamId }],
      isDeleted: false
    }).session(session);

    if (!board) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: "Board not found" });
    }

    // Generate key from name
    const key = name.toLowerCase();

    // Check for duplicate column key
    if (board.columns.some(col => col.key === key)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: "Column with this key already exists" });
    }

    // Calculate next order value
    const maxOrder = board.columns.reduce((max, col) => Math.max(max, col.order), -1);
    const order = maxOrder + 1;

    // Add column to board
    board.columns.push({
      name,
      key,
      order,
      color: req.body.color || "#" + Math.floor(Math.random() * 16777215).toString(16)
    });

    // If board has workflow, add corresponding state + transitions
    if (board.workflow) {
      const workflow = await Workflow.findById(board.workflow).session(session);
      if (workflow) {
        const newState = {
          key,
          name,
          order,
          color: req.body.color || "#" + Math.floor(Math.random() * 16777215).toString(16)
        };

        // Add the new state
        workflow.states.push(newState);

        // Generate new transitions
        const newTransitions = [];

        // Include new transitions from existing states to the new state
        for (const existingState of workflow.states) {
          if (existingState.key !== key) {
            newTransitions.push({
              fromKey: existingState.key,
              toKey: newState.key,
              fromOrder: existingState.order,
              toOrder: newState.order
            });
          }
        }

        // Include new transitions from the new state to all other states
        for (const existingState of workflow.states) {
          if (existingState.key !== key) {
            newTransitions.push({
              fromKey: newState.key,
              toKey: existingState.key,
              fromOrder: newState.order,
              toOrder: existingState.order
            });
          }
        }

        // Push new transitions
        workflow.transitions = [...workflow.transitions, ...newTransitions];

        await workflow.save({ session });
      }
    }
    await board.save({ session });
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      message: "Column added successfully",
      column: {
        name,
        key,
        order
      }
    });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({
      error: "Internal server error",
      details: err.message
    });
  }
};

// 🔹 Update column (with workflow state sync)
export const updateColumn = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { boardId } = req.params;
    const { columnId, name, color } = req.body;

    // Validate name
    if (!name || typeof name !== "string" || name.trim() === "") {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: "Column name is required" });
    }

    const board = await Board.findById(boardId).session(session);
    if (!board || board.isDeleted) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: "Board not found" });
    }

    const column = board.columns.id(columnId);
    if (!column) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: "Column not found" });
    }

    // Store oldKey BEFORE changing anything
    const oldKey = column.key;
    const newKey = name.toLowerCase().trim();

    const isDuplicate = board.columns.some(col =>
      col._id.toString() !== columnId && col.key === newKey
    );
    if (isDuplicate) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: "Column with this key already exists" });
    }

    // Update column details
    column.name = name;
    column.key = newKey;
    if (color) column.color = color;

    // Update matching workflow state if applicable
    if (board.workflow) {
      const workflow = await Workflow.findById(board.workflow).session(session);
      if (workflow) {
        const state = workflow.states.find(s => s.key === oldKey);
        if (state) {
          state.name = name;
          state.key = newKey;
          if (color) state.color = color;
          await workflow.save({ session });
        }
      }
    }

    // Update tasks that match the old column key
    await Task.updateMany(
      { boardId, status: oldKey },
      { $set: { status: newKey } },
      { session }
    );

    await board.save({ session });
    await session.commitTransaction();
    session.endSession();

    return res.json({
      success: true,
      message: "Column updated successfully",
      column: {
        id: columnId,
        name,
        key: newKey,
        color: column.color
      }
    });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error updating column:", err);
    return res.status(500).json({
      error: "Internal server error",
      details: err.message
    });
  }
};



// 🔹 Delete column (with workflow state sync)
export const deleteColumn = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { boardId } = req.params;
    const { columnId } = req.body;

    // Fetch board
    const board = await Board.findById(boardId).session(session);
    if (!board || board.isDeleted) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: "Board not found" });
    }

    // Find the column
    const column = board.columns.id(columnId);
    if (!column) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: "Column not found" });
    }

    const columnKey = column.key;

    // Prevent deletion if tasks exist in that column
    const taskCount = await Task.countDocuments({
      boardId: board._id,
      columnOrder: column.order
    }).session(session);

    if (taskCount > 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        error: "Cannot delete column with tasks. Move tasks first."
      });
    }

    // Remove corresponding workflow state & transitions
    if (board.workflow && columnKey) {
      const workflow = await Workflow.findById(board.workflow).session(session);

      if (workflow) {
        // Remove the state matching the column key
        workflow.states = workflow.states.filter(
          (state) => state.key !== columnKey
        );

        // Remove transitions involving this state
        workflow.transitions = workflow.transitions.filter(
          (t) => t.fromKey !== columnKey && t.toKey !== columnKey
        );

        await workflow.save({ session });
      }
    }

    // Remove the column from the board
    column.remove();
    await board.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({
      success: true,
      message: "Column deleted successfully",
      remainingColumns: board.columns.length
    });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({
      error: "Internal server error",
      details: err.message
    });
  }
};
