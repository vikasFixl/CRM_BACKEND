import ImprovementPlan from "../../../models/NHRM/PerformanceManagement/improvementPlans.js";
import mongoose, { get } from "mongoose";
export const createImprovementPlan = async (req, res) => {
  try {
    const organization = req.orgUser.orgId;
    const createdBy = req.user.userId;

    const { employee, objectives, actions, timeline, planDate } = req.body;

    if (!employee || !objectives || !actions || !timeline) {
      return res.status(400).json({ message: "Required fields missing." });
    }

    const newPlan = await ImprovementPlan.create({
      organization,
      employee,
      objectives,
      actions,
      timeline,
      planDate: planDate || Date.now(),
      createdBy
    });

    return res.status(201).json({
      message: "Improvement plan created successfully",
       newPlan
    });

  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getImprovementPlanById = async (req, res) => {
  try {
    const { id } = req.params;
    const organization = req.orgUser.orgId;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid plan ID" });
    }

    const plan = await ImprovementPlan.findOne({
      _id: id,
      organization
    })
      .populate("employee", "personalInfo.fullName personalInfo.contact.email")
      .populate("createdBy", "name email");

    if (!plan) {
      return res.status(404).json({ message: "Improvement plan not found" });
    }

    return res.status(200).json({message: "Improvement plan fetched successfully", plan });

  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getAllImprovementPlans = async (req, res) => {
  try {
    const organization = req.orgUser.orgId;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const status = req.query.status;
    const employee = req.query.employee;

    const skip = (page - 1) * limit;

    const filter = { organization };
    if (status) filter.status = status;
    if (employee) filter.employee = employee;

    const total = await ImprovementPlan.countDocuments(filter);

    const plans = await ImprovementPlan.find(filter)
      .populate("employee", "personalInfo.fullName personalInfo.contact.email")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
        message: "Improvement plans fetched successfully",
      total,
      totalPages: Math.ceil(total / limit),
      page,
      limit,
      count: plans.length,
       plans
    });

  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

export const getEmployeeImprovementPlans = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const organization = req.orgUser.orgId;

    if (!mongoose.isValidObjectId(employeeId)) {
      return res.status(400).json({ message: "Invalid employee ID" });
    }

    const plans = await ImprovementPlan.find({
      employee: employeeId,
      organization
    })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
 message: "Improvement plans fetched successfully",
      count: plans.length,
       plans
    });

  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

export const updateImprovementPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const organization = req.orgUser.orgId;

    const updates = req.body;

    const plan = await ImprovementPlan.findOneAndUpdate(
      { _id: id, organization },
      updates,
      { new: true }
    );

    if (!plan) {
      return res.status(404).json({ message: "Improvement plan not found" });
    }

    return res.status(200).json({
      message: "Improvement plan updated successfully",
    plan
    });

  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

export const deleteImprovementPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const organization = req.orgUser.orgId;

    const plan = await ImprovementPlan.findOneAndDelete({
      _id: id,
      organization
    });

    if (!plan) {
      return res.status(404).json({ message: "Improvement plan not found" });
    }

    return res.status(200).json({
      message: "Improvement plan deleted successfully"
    });

  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

export const getMyImprovementPlans = async (req, res) => {
  try {
    const createdBy = req.user.userId;
    const organization = req.orgUser.orgId;

    const plans = await ImprovementPlan.find({
      createdBy,
      organization
    })
      .populate("employee", "personalInfo.fullName personalInfo.contact.email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: " improvement plans fetched successfully",
      count: plans.length,
       plans
    });

  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};
