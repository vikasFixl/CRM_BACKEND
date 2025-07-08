import { Workflow } from "../../models/project/WorkflowModel.js";

export const createWorkflow = async (req, res) => {
  try {
    const { name, projectId, teamId, states, transitions, isDefaultWorkflow } = req.body;

    if (!projectId && !teamId) {
      return res.status(400).json({ message: "Either projectId or teamId is required." });
    }

    const workflow = new Workflow({
      name,
      projectId,
      teamId,
      states,
      transitions,
      isDefaultWorkflow,
      createdBy: req.user._id,
    });

    await workflow.save();
    return res.status(201).json({ success: true, data: workflow });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};




export const getWorkflows = async (req, res) => {
  try {
    const { projectId, teamId, boardId } = req.query;
    const query = { isDeleted: false };

    if (boardId) {
      const board = await Board.findById(boardId).select("projectId teamId");
      if (!board) return res.status(404).json({ message: "Board not found" });

      if (board.teamId) query.teamId = board.teamId;
      else query.projectId = board.projectId;
    } else {
      if (teamId) query.teamId = teamId;
      if (projectId) query.projectId = projectId;
    }

    const workflows = await Workflow.find(query).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: workflows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
export const getWorkflowById = async (req, res) => {
  try {
    const workflow = await Workflow.findOne({ _id: req.params.id, isDeleted: false });
    if (!workflow) {
      return res.status(404).json({ message: "Workflow not found" });
    }
    return res.status(200).json({ success: true, data: workflow });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateWorkflow = async (req, res) => {
  try {
    const { name, states, transitions, isDefaultWorkflow } = req.body;

    const workflow = await Workflow.findById(req.params.id);
    if (!workflow || workflow.isDeleted) {
      return res.status(404).json({ message: "Workflow not found" });
    }

    if (name) workflow.name = name;
    if (states) workflow.states = states;
    if (transitions) workflow.transitions = transitions;
    if (typeof isDefaultWorkflow === "boolean") workflow.isDefaultWorkflow = isDefaultWorkflow;

    await workflow.save();
    return res.status(200).json({ success: true, data: workflow });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteWorkflow = async (req, res) => {
  try {
    const workflow = await Workflow.findById(req.params.id);
    if (!workflow || workflow.isDeleted) {
      return res.status(404).json({ message: "Workflow not found" });
    }

    workflow.isDeleted = true;
    await workflow.save();

    return res.status(200).json({ success: true, message: "Workflow deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
export const getWorkflowForBoard = async (boardId) => {
  const board = await Board.findById(boardId).select("projectId teamId");
  if (!board) throw new Error("Board not found");

  const query = board.teamId
    ? { teamId: board.teamId, isDeleted: false }
    : { projectId: board.projectId, isDeleted: false };

  return Workflow.find(query);
};

