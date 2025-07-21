import { Workflow } from "../../models/project/WorkflowModel.js";
import { Board } from "../../models/project/BoardMode.js";
import mongoose from "mongoose";
import { updateWorkflowSchema } from "../../validations/project/workflow.js";
// import { StatusCodes } from 'http-status-codes';
import { StatusCodes } from 'http-status-codes';

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
    const { projectId, workflowId } = req.params;

    /* ---------- 1. Validate both IDs ---------- */
    const ids = { projectId, workflowId };
    for (const [key, id] of Object.entries(ids)) {
      if (!id || !mongoose.isValidObjectId(id)) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: `${key} is invalid or missing` });
      }
    }

    /* ---------- 2. Fetch workflow scoped to project ---------- */
    const workflow = await Workflow.findOne({
      _id: workflowId,
      projectId,
    }).select('states transitions');

    if (!workflow) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: 'Workflow not found for the specified project' });
    }

    /* ---------- 3. Respond ---------- */
    return res.status(StatusCodes.OK).json({
      message: 'Workflow retrieved successfully',
      workflow,
    });
  } catch (error) {
    console.error('Error in getWorkflow:', error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: 'Failed to retrieve workflow' });
  }
};



export const updateWorkflow = async (req, res) => {
  try {
    /* ---------- 1. Validate payload ---------- */
    const { data, error } = updateWorkflowSchema.safeParse(req.body);
    if (error) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Validation failed',
        errors: error.errors.map(e => e.message),
      });
    }

    const { name, transitions } = data;
    const { workflowId } = req.params;

    /* ---------- 2. Validate workflowId ---------- */
    if (!mongoose.isValidObjectId(workflowId)) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid workflow ID' });
    }

    /* ---------- 3. Fetch workflow ---------- */
    const workflow = await Workflow.findOne({ _id: workflowId, isDeleted: false });
    if (!workflow) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Workflow not found' });
    }

    /* ---------- 4. Map states for fast lookup ---------- */
    const stateMap = new Map(workflow.states.map(s => [s.key, s]));

    /* ---------- 5. Validate transitions ---------- */
    if (!transitions?.length) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'At least one transition is required' });
    }

    for (const { fromKey, toKey, fromOrder, toOrder } of transitions) {
      const fromState = stateMap.get(fromKey);
      const toState   = stateMap.get(toKey);

      if (!fromState || !toState) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: `Invalid transition: unknown state key "${fromKey}" or "${toKey}"`,
        });
      }

      if (fromState.order !== fromOrder || toState.order !== toOrder) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: `Order mismatch for transition "${fromKey}"→"${toKey}"`,
        });
      }
    }

    /* ---------- 6. Apply updates ---------- */
    if (name) workflow.name = name.trim();
    workflow.transitions = transitions;

    await workflow.save();

    return res.status(StatusCodes.OK).json({
      success: true,
      data: workflow,
    });
  } catch (err) {
    console.error('Workflow update error:', err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Unable to update workflow',
    });
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
export const getWorkflowForBoard = async (req, res) => {
  try {
    const { boardId } = req.params;

    // Validate boardId
    if (!mongoose.Types.ObjectId.isValid(boardId)) {
      return res.status(400).json({ message: "Invalid board ID" });
    }

    // Fetch board
    const board = await Board.findById(boardId).select("projectId teamId");
    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }

    // Build query based on board type
    const query = board.teamId
      ? { teamId: board.teamId, isDeleted: false }
      : { projectId: board.projectId, isDeleted: false };

    const workflows = await Workflow.find(query);

    return res.status(200).json({
      message: "Workflows fetched successfully",
      workflows,
    });
  } catch (error) {
    console.error("Error fetching workflows for board:", error);
    return res.status(500).json({
      message: "Internal server error while fetching workflows",
      error: error.message,
    });
  }
};


