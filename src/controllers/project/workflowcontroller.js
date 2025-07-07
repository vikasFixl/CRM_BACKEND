import { Workflow } from "../../models/project/WorkflowModel.js";

// ✅ Create a new workflow
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

// ✅ Get all workflows for a project or team
export const getWorkflows = async (req, res) => {
  try {
    const { projectId, teamId } = req.query;

    const query = { isDeleted: false };
    if (projectId) query.projectId = projectId;
    if (teamId) query.teamId = teamId;

    const workflows = await Workflow.find(query).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: workflows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get single workflow by ID
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

// ✅ Update workflow
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

// ✅ Soft delete workflow
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
