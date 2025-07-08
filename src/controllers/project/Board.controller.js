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

// 🔹 Get board details with workflow
export const getBoard = async (req, res) => {
  try {
    const board = await Board.findById(req.params.boardId)
      .populate('workflow')
      .lean();

    if (!board) {
      return res.status(404).json({ error: "Board not found" });
    }

    // Enhance response with workflow details
    const response = {
      ...board,
      workflowStates: board.workflow?.states || [],
      workflowTransitions: board.workflow?.transitions || []
    };

    res.json({ success: true, board: response });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// 🔹 Delete board (soft delete)
export const deleteBoard = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const board = await Board.findById(req.params.boardId).session(session);
    
    if (!board) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: "Board not found" });
    }

    // Check for existing tasks
    const taskCount = await Task.countDocuments({ boardId: board._id }).session(session);
    if (taskCount > 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ 
        error: "Cannot delete board with existing tasks" 
      });
    }

    // Soft delete
    board.isDeleted = true;
    await board.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({ success: true, message: "Board deleted" });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ error: err.message });
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
    const key = name.toLowerCase().replace(/\s+/g, '_');

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
      color: req.body.color || "#" + Math.floor(Math.random()*16777215).toString(16)
    });

    // If board has workflow, add corresponding state
    if (board.workflow) {
      const workflow = await Workflow.findById(board.workflow).session(session);
      if (workflow) {
        workflow.states.push({
          key,
          name,
          order,
          color: req.body.color || "#" + Math.floor(Math.random()*16777215).toString(16)
        });
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

    // Validate inputs
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

    // Generate new key from name
    const newKey = name.toLowerCase().replace(/\s+/g, '_');

    // Check for duplicate key (excluding current column)
    if (board.columns.some(col => 
      col._id.toString() !== columnId && col.key === newKey
    )) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: "Column with this key already exists" });
    }

    const oldKey = column.key;

    // Update column
    column.name = name;
    column.key = newKey;
    if (color) column.color = color;

    // If board has workflow, update corresponding state
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

    await board.save({ session });
    await session.commitTransaction();
    session.endSession();

    res.json({ 
      success: true, 
      message: "Column updated",
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
    res.status(500).json({ 
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

    // Check for tasks in this column
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

    // If board has workflow, remove corresponding state
    if (board.workflow) {
      const workflow = await Workflow.findById(board.workflow).session(session);
      if (workflow) {
        workflow.states = workflow.states.filter(s => s.key !== column.key);
        
        // Remove any transitions involving this state
        workflow.transitions = workflow.transitions.filter(
          t => t.fromKey !== column.key && t.toKey !== column.key
        );
        
        await workflow.save({ session });
      }
    }

    // Remove column
    column.remove();
    await board.save({ session });
    await session.commitTransaction();
    session.endSession();

    res.json({ 
      success: true, 
      message: "Column deleted",
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