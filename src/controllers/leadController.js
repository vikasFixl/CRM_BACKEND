import { Lead } from "../models/leadModel.js";
import {
  leadSchema,
  updateLeadSchema,
  updateLeadStageSchema,
} from "../validations/lead/leadValidation.js";
import mongoose from "mongoose";
import ActivityModel from "../models/activityModel.js";
// Create a new lead
export const createLead = async (req, res, next) => {
  const userId = req.user.userId;
  const orgId = req.orgUser.orgId;
  const empid = req.orgUser.employeeId;
  const loggedinuserEmail = req.user.email;

  try {
    const parsed = leadSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation error",
        errors: parsed.error.errors.map((e) => e.message),
      });
    }
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
    const existingLead = await Lead.findOne({
      title,
      deleted: { $ne: true },
      orgId: orgId,
    });

    if (existingLead) {
      return res.status(409).json({ message: "Lead name already taken" });
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
    // Create activity for lead creation
    const activity = await ActivityModel.create({
      leadId: lead._id,
      orgId: orgId,
      activityDesc: `Lead created by ${loggedinuserEmail} with empid ${empid}`,
      activity: "create",
      module: "lead",
      entityId: lead._id,
      userId,
    });
    await activity.save();

    res.status(201).json({
      message: "Lead created successfully",
      code: 201,
      success: true,
    });
  } catch (err) {
    console.error("Error creating lead:", err);
    next(err);
  }
};
export const getAllLeads = async (req, res, next) => {
  const orgId = req.orgUser.orgId;
  if (!orgId) {
    return res.status(400).json({ message: "Org id is required" });
  }
  if (!mongoose.Types.ObjectId.isValid(orgId))
    return res.status(400).json({
      message: "Invalid org id try logging in.",
      code: 400,
      success: false,
    });
  try {
    const leads = await Lead.find({
      orgId,
      deleted: { $ne: true },
    })
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
        title: 1,
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
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: "Lead id is required" });
  }
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(400).json({
      message: "invalid id.",
      code: 400,
      success: false,
    });
  try {
    const lead = await Lead.findOne({
      _id: id,
      deleted: { $ne: true },
    })
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
export const updateLead = async (req, res, next) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: "Lead id is required" });
  }
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(400).json({
      message: "invalid  id.",
      code: 400,
      success: false,
    });
  const parsed = updateLeadSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: "Validation error",
      errors: parsed.error.errors.map((e) => e.message),
    });
  }
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

    // add activity
    const activity = await ActivityModel.create({
      activityDesc: `Lead updated by ${loggedinuserEmail} with id ${empid}`,
      userId,
      orgId,
      activity: "update",
      module: "lead",
      entityId: id,
    });
    await activity.save();
    res.status(200).json({ message: "Lead updated successfully", updatedLead });
  } catch (err) {
    console.error("Error updating lead:", err);
    return res.status(500).json({ message: "Failed to update lead" });
  }
};

export const updateLeadStage = async (req, res) => {
  const orgId = req.orgUser.orgId;
  const userId = req.user.userId;
  const loggedinuserEmail = req.user.email;
  const empid = req.orgUser.employeeId;
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: "Lead id is required" });
  }

  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(400).json({
      message: "invalid id.",
      code: 400,
      success: false,
    });
  const parsed = updateLeadStageSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: "Validation failed",
      errors: parsed.error.errors.map((e) => e.message),
    });
  }

  const stage = parsed.data.stage;

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
    console.log("Lead stage updated successfully");
    // add activity
    const activity = await ActivityModel.create({
      activityDesc: `Lead stage updated by ${loggedinuserEmail} with id ${empid}`,
      userId,
      orgId,
      activity: "update",
      module: "lead",
      entityId: lead._id,
    });
    await activity.save();
    console.log("Activity added successfully");

    res.status(200).json({ message: "Lead stage updated successfully" });
  } catch (err) {
    console.log("Error updating lead stage:", err);
    return res
      .status(500)
      .json({ message: "Failed to update lead stage", error: err });
  }
};
export const getLeadStageHistory = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Lead id is required" });
    }
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({
        message: "invalid id.",
        code: 400,
        success: false,
      });
    const lead = await Lead.findOne({ _id: id, deleted: false }).select(
      "stageHistory"
    );

    if (!lead) {
      return res.status(404).json({ message: "no stage history found" });
    }

    res.status(200).json({
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
    const userId = req.user.userId;
    const loggedinuserEmail = req.user.email;
    const empid = req.orgUser.employeeId;

    if (!Array.isArray(leadIds) || leadIds.length === 0) {
      return res
        .status(400)
        .json({ message: "leadIds must be a non-empty array" });
    }
    // find lead and check orgId
    const leads = await Lead.find({ orgId: orgId });
    if (!leads) {
      return res.status(404).json({ message: "Leads not found" });
    }
    const result = await Lead.updateMany(
      { _id: { $in: leadIds } },
      { $set: { deleted: true } },
      { $set: { deletedAt: new Date() } }
    );
    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: "Leads not found" });
    }
    leads.forEach((lead) => {
      if (leadIds.includes(lead._id.toString())) {
        lead.deleted = true;
        lead.deletedAt = new Date();
      }
    });
    //   add activity
    const activity = await ActivityModel.create({
      activityDesc: `Leads deleted by ${loggedinuserEmail} with id ${empid}`,
      userId,
      orgId,
      activity: "delete",
      module: "lead",
      // entityId: leadIds,
    });
    await activity.save();
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

export const getAllDeletedLead = async (req, res) => {
  try {
    const orgId = req.orgUser?.orgId;
    const deletedLeads = await Lead.find({ orgId, deleted: { $ne: false } })
      .sort({ updatedAt: -1 })
      .select({
        _id: 1,
        LeadId: 1,
        stage: 1,
        status: 1,
        priority: 1,
        leadScore: 1,
        title: 1,
        description: 1,
      });
    return res.status(200).json({
      message: "Soft-deleted leads fetched successfully",
      success: true,
      code: 200,
      data: deletedLeads,
    });
  } catch (error) {
    console.error("Error in getAllDeletedLead:", error);
    return res.status(500).json({
      success: false,
      code: 500,
      message: "Internal server error.",
    });
  }
};

export const restoreLead = async (req, res) => {
  try {
    const { id } = req.params;
    const orgId = req.orgUser.orgId;
    const userId = req.user.userId;
    const loggedinuserEmail = req.user.email;
    const empid = req.orgUser.employeeId;

    if (!id) {
      return res.status(400).json({ message: "Lead ID is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid ID.",
        code: 400,
        success: false,
      });
    }

    const leads = await Lead.findOne({ _id: id, deleted: { $ne: false } });
    if (!leads) {
      return res
        .status(404)
        .json({ message: "Lead not found or not deleted" });
    }

    leads.deleted = false;
    leads.deletedAt = null;

    await leads.save();

    // Add activity
    const activity = await ActivityModel.create({
      activityDesc: `Lead restored by ${loggedinuserEmail} with id ${empid}`,
      userId,
      orgId,
      activity: "restore",
      module: "lead",
      entityId: leads._id,
    });

    await activity.save();

    return res.status(200).json({
      message: "Lead restored successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error in restoreLead:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


export const getLeadsByStatusAndFirm = async (req, res) => {
  try {
    const { firmId, status } = req.body;
    console.log(req.body);

    const leads = await Lead.find({
      firmId,
      delete: { $ne: false },
      status,
    }).sort({ _id: -1 });

    if (!leads || leads.length === 0) {
      return res.status(200).json({
        success: true,
        message: `No leads found with status "${status}".`,
        data: [],
        status: 200,
      });
    }

    res.status(200).json({
      success: true,
      message: `List of all leads with status "${status}".`,
      data: leads,
      status: 200,
    });
  } catch (error) {
    console.error("Error in getLeadsByStatusAndFirm:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching leads.",
      error: error.message,
      status: 500,
    });
  }
};

export const updateLeadStatus = async (req, res) => {
  try {
    const { leadId, status } = req.body;
    const lead = await Lead.findById(leadId);
    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }
    lead.status = status;
    await lead.save();
    res.status(200).json({ message: "Lead status updated successfully" });
  } catch (error) {
    console.error("Error in updateLeadStatus:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};