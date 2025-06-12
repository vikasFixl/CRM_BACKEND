import { Lead } from "../models/leadModel.js";
import {
  leadSchema,
  updateLeadSchema,
  updateLeadStageSchema,
} from "../validations/lead/leadValidation.js";

// Create a new lead
export const createLead = async (req, res) => {
  const userId = req.user.userId;
  const orgId = req.orgUser.orgId;

  try {

    const parsed = leadSchema.safeParse(req.body);
    const {
      title,
      description,
      client,
      address,
      estimatedWorth,
      currency,
      status,
      stage,
      pipeline,
      tags,
      timezone,
      interactions, // Assuming a single interaction object from body
      closureDate,
      followUpDate,
      priority,
      nextAction,
      customNextAction,
      notes,
      firmId,
    } = parsed.data;

    // Build interaction array (if interaction is provided)
    const totalinteractions = interactions.map((interaction) => ({
      type: interaction.type,
      description: interaction.description,
      createdBy: userId,
    }));

    // Create initial stageHistory entry
    const stageHistory = [
      {
        stageName: stage,
        startedAt: new Date(),
      },
    ];
// check if lead name already present 
const existingLead = await Lead.findOne({ title, deleted: false ,orgId:orgId});
console.log(existingLead,"existingLead");

if (existingLead) {
  return res.status(400).json({ message: "Lead name already taken" });
}
    const lead = await Lead.create({
      title,
      description,
      client,
      address,
      estimatedWorth,
      currency,
      stage,
      stageHistory,
      status,
      pipeline,
      tags,
      orgId,
      firmId,
      leadManagerId: userId,
      assignedToId: userId,
      timezone,
      interactions: totalinteractions,
      closureDate,
      followUpDate,
      priority,
      nextAction,
      customNextAction,
      notes,
    });
    await lead.save();

    res.status(201).json({
      message: "Lead created successfully",
    });
  } catch (error) {
    console.error("Error creating lead:", error);
    res
      .status(500)
      .json({ message: "Failed to create lead", error: error.message });
  }
};
export const getAllLeads = async (req, res) => {
  try {
    const leads = await Lead.find({ orgId: req.orgUser.orgId, deleted: false })
      .select({
        _id: 1,
        LeadId: 1,
        stage: 1,
        status: 1,
        priority: 1,
        leadScore: 1,
        followUpDate: 1,
        nextAction: 1,
        "client.email": 1,
      })
      .lean();
    if (!leads) {
      return res.status(404).json({ message: "No leads found" });
    }
    res.status(200).json({ message: "Leads fetched successfully", leads });
  } catch (error) {
    console.error("Error fetching leads:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch leads", error: error.message });
  }
};

export const getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findOne({ _id: req.params.id, deleted: false })
      .populate("orgId", "name")
      .populate("firmId", "name")
      .lean();
    if (!lead) {
      return res.status(404).json({ message: "Lead not found or deleted" });
    }
    res.status(200).json({ message: "Lead fetched successfully", lead });
  } catch (error) {
    console.error("Error fetching lead:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch lead", error: error.message });
  }
};
export const updateLead = async (req, res) => {
  const { id } = req.params;
  const parsed = updateLeadSchema.safeParse(req.body);
  const updateData = parsed.data;
  const findlead = await Lead.findOne({ _id: id, deleted: false });

  if (!findlead) {
    return res.status(404).json({ message: "Lead not found or deleted" });
  }
  try {
    const updatedLead = await Lead.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedLead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    res.status(200).json({ message: "Lead updated successfully", updatedLead });
  } catch (error) {
    console.error("Error updating lead:", error);
    res
      .status(500)
      .json({ message: "Failed to update lead", error: error.message });
  }
};

export const updateLeadStage = async (req, res) => {
  const { id } = req.params;
  const parsed = updateLeadStageSchema.safeParse(req.body);
  console.log(parsed);
  const { stage } = parsed.data;

  try {
    const lead = await Lead.findOne({ _id: id, deleted: false });
    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    const currentStage = lead.stage;

    if (currentStage === stage) {
      return res.status(400).json({ message: "Lead is already in this stage" });
    }

    // End the last stage in history
    const lastStage = lead.stageHistory[lead.stageHistory.length - 1];
    if (lastStage && !lastStage.endedAt) {
      lastStage.endedAt = new Date();
    }

    // Add new stage to history
    lead.stage = stage;
    lead.stageHistory.push({
      stageName: stage,
      startedAt: new Date(),
    });

    await lead.save();

    res.status(200).json({ message: "Lead stage updated successfully" });
  } catch (error) {
    console.error("Error updating lead stage:", error);
    res
      .status(500)
      .json({ message: "Failed to update lead stage", error: error.message });
  }
};
export const getLeadStageHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const lead = await Lead.findOne( {_id: id, deleted: false }).select("stageHistory");

    if (!lead) {
      return res.status(404).json({ message: "no stage history found" });
    }

    res
      .status(200)
      .json({
        message: "stage history fetched successfully",
        stageHistory: lead.stageHistory,
      });
  } catch (error) {
    console.error("Error fetching stage history:", error);
    res.status(500).json({ message: "Failed to fetch stage history" });
  }
};

export const bulkDeleteLeads = async (req, res) => {
  try {
    const { leadIds } = req.body;
    const orgId = req.orgUser.orgId;

    if (!Array.isArray(leadIds) || leadIds.length === 0) {
      return res
        .status(400)
        .json({ message: "leadIds must be a non-empty array" });
    }
    // find lead and check orgId
    const leads = await Lead.find({ orgId: orgId, });
    if (!leads) {
      return res.status(404).json({ message: "Leads not found" });
    }
    const result = await Lead.updateMany(
      { _id: { $in: leadIds } },
      { $set: { deleted: true } },
      {$set: { deletedAt: new Date() }}
    );

    res.status(200).json({
      message: "Leads deleted successfully",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Bulk delete failed:", error);
    res
      .status(500)
      .json({ message: "Failed to delete leads", error: error.message });
  }
};
