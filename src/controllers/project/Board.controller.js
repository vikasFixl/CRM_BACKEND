import { Board } from "../../models/project/BoardMode.js"; // assumed task model exists
import mongoose from "mongoose";
import { Task } from "../../models/project/TaskModel.js";

// 🔹 Create a new board
export const createBoard = async (req, res) => {
  try {
    const board = await Board.create(req.body);
    res.status(201).json({ success: true, board });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// 🔹 Get board details
export const getBoard = async (req, res) => {
  try {
    const board = await Board.findById(req.params.boardId).lean();
    if (!board) return res.status(404).json({ error: "Board not found" });
    res.json({ success: true, board });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// // 🔹 Update board
// export const updateBoard = async (req, res) => {
//   try {
//     const board = await Board.findByIdAndUpdate(req.params.boardId, req.body, {
//       new: true,
//     });
//     if (!board) return res.status(404).json({ error: "Board not found" });
//     res.json({ success: true, board });
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// };

// 🔹 Delete board (soft delete)
export const deleteBoard = async (req, res) => {
  try {
    await Board.findByIdAndUpdate(req.params.boardId, { isDeleted: true });
    res.json({ success: true, message: "Board deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
// 🔹 Add column
export const addColumn = async (req, res) => {
  const { boardId } = req.params;
  const { name, projectId } = req.body;

  const isAlpha = /^[A-Za-z\s]+$/.test(name);

  if (!isAlpha) {
    return res
      .status(400)
      .json({
        error:
          "Column name must contain only alphabetic characters (A-Z or a-z)",
      });
  }
  // Validate IDs
  if (!mongoose.Types.ObjectId.isValid(boardId)) {
    return res.status(400).json({ error: "Invalid board ID" });
  }
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    return res.status(400).json({ error: "Invalid project ID" });
  }

  // Validate name
  if (!name || typeof name !== "string" || name.trim() === "") {
    return res.status(400).json({ error: "Column name (key) is required" });
  }

  try {
    const board = await Board.findOne({
      _id: boardId,
      projectId,
      isDeleted: false,
    });
    if (!board) {
      return res
        .status(404)
        .json({ error: "Board not found for this project" });
    }

    // Check if column with same key (name) already exists
    const isDuplicate = board.columns.some(
      (col) => col.key === name.toLowerCase()
    );
    if (isDuplicate) {
      return res
        .status(400)
        .json({ error: "Column with this key already exists" });
    }

    // Get max order
    const maxOrder = board.columns.reduce(
      (max, col) => Math.max(max, col.order ?? 0),
      0
    );
    const nextOrder = maxOrder + 1;

    // Push new column
    board.columns.push({
      name,
      key: name, // use name as key
      order: nextOrder,
    });

    await board.save();

    res.status(201).json({
      success: true,
      message: "Column added successfully",
      columns: board.columns,
    });
  } catch (err) {
    console.error("Add column error:", err);
    res
      .status(500)
      .json({ error: "Internal server error", details: err.message });
  }
};

// 🔹 Update column
export const updateColumn = async (req, res) => {
  const { name, columnId } = req.body;
  const { boardId } = req.params;
  const isAlpha = /^[A-Za-z\s]+$/.test(name);

  if (!isAlpha) {
    return res
      .status(400)
      .json({
        error:
          "Column name must contain only alphabetic characters (A-Z or a-z)",
      });
  }

  try {
    const board = await Board.findById(boardId);
    if (!board || board.isDeleted) {
      return res.status(404).json({ error: "Board not found" });
    }

    const column = board.columns.id(columnId);
    if (!column) {
      return res.status(404).json({ error: "Column not found" });
    }

    // Check if new name already exists in other columns (case-insensitive)
    const isDuplicate = board.columns.some(
      (col) => col._id.toString() !== columnId && col.key === name.toLowerCase()
    );
    if (isDuplicate) {
      return res.status(400).json({ error: "Column name already exists" });
    }

    // Update column name
    column.name = name;

    // Update key as lowercase of new name
    column.key = name.toLowerCase().replace(/\s+/g, "_");

    await board.save();

    res.json({ success: true, message: "Column updated", column });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Internal server error", details: err.message });
  }
};

// 🔹 Delete column
export const deleteColumn = async (req, res) => {
  const { boardId } = req.params;
  const { columnId, projectId } = req.body;

  // Validate ObjectIds
  if (!mongoose.Types.ObjectId.isValid(boardId)) {
    return res.status(400).json({ error: "Invalid board ID" });
  }
  if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
    return res.status(400).json({ error: "Invalid project ID" });
  }
  if (!columnId || !mongoose.Types.ObjectId.isValid(columnId)) {
    return res.status(400).json({ error: "Invalid column ID" });
  }

  try {
    // Find board under the correct project
    const board = await Board.findOne({
      _id: boardId,
      projectId,
      isDeleted: false,
    });
    if (!board) {
      return res
        .status(404)
        .json({ error: "Board not found for the given project" });
    }

    // Try to find the column inside columns array
    const column = board.columns.id(columnId);
    if (!column) {
      return res.status(404).json({ error: "Column not found" });
    }
    // check if some task are in this column
    const task = await Task.find({ columnOrder: column.order });
    if (task.length > 0) {
      return res.status(400).json({
        error: "cannot delte column try moving task to another column",
      });
    }

    // Remove the column
    column.remove();

    // Save the board
    await board.save();

    res.status(200).json({
      success: true,
      message: "Column deleted successfully",
      columns: board.columns,
    });
  } catch (err) {
    console.error("Delete column error:", err);
    res
      .status(500)
      .json({ error: "Internal server error", details: err.message });
  }
};



