import { Workflow } from "../../models/project/WorkflowModel.js";
import { Board } from "../../models/project/BoardMode.js";
import mongoose from "mongoose";
import { updateWorkflowSchema } from "../../validations/project/workflow.js";

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




// get workflow baed on proejct id and team id for team specif workflow 
export const getWorkflow = async (req, res) => {
  try {
    const { projectId } = req.params
    const { teamId } = req.body;
    if (!projectId || !mongoose.isValidObjectId(projectId)) {
      return res.status(400).json({ message: " project id invalid or empty ." });
    }

    const filter = {};

    if (projectId) {
      filter.projectId = projectId;
    } else if (teamId) {
      filter.teamId = teamId;
    }

    const workflow = await Workflow.findOne(filter);

    if (!workflow) {
      return res.status(404).json({ message: "Workflow not found for given context" });
    }

    return res.status(200).json({
      message: "Workflow fetched successfully",
      workflow,
    });
  } catch (error) {
    console.error("Error in getWorkflowById:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateWorkflow = async (req, res) => {
  try {
    const parsed = updateWorkflowSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Validation error", errors: parsed.error.errors.map((e) => e.message) });
    }

    const { name, transitions } = parsed.data;
    const workflowId = req.params.workflowId;

    if (!name) {
      return res.status(400).json({ message: "name is required" });
    }

    if (!transitions || transitions.length === 0) {
      return res.status(400).json({ message: "transitions are required" });
    }

    // 1. Fetch the workflow by ID
    const workflow = await Workflow.findById(workflowId);
    if (!workflow || workflow.isDeleted) {
      return res.status(404).json({ message: "Workflow not found" });
    }

    // 2. Update name if provided
    if (name) {
      workflow.name = name;
    }

    // 3. Validate and update transitions
    if (Array.isArray(transitions)) {
      const validKeys = workflow.states.map((state) => state.key);

      for (const { fromKey, toKey, fromOrder, toOrder } of transitions) {
        const fromState = workflow.states.find((s) => s.key === fromKey);
        const toState = workflow.states.find((s) => s.key === toKey);

        // Validate keys
        if (!fromState || !toState) {
          return res.status(400).json({
            message: `Invalid transition states.`,
          });
        }

        // Validate order consistency
        if (fromOrder !== fromState.order || toOrder !== toState.order) {
          return res.status(400).json({
            message: `Invalid order: fromOrder ${fromOrder} or toOrder ${toOrder} does not match the order in workflow states.".`,
          });
        }
      }

      workflow.transitions = transitions;
    }

    // 4. Save and return
    await workflow.save();
    return res.status(200).json({ success: true, data: workflow });

  } catch (error) {
    console.error("Workflow update error:", error);
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

