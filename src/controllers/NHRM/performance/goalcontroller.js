import GoalSetting from "../../../models/NHRM/PerformanceManagement/goalSetting.js";
import mongoose from "mongoose";
export const createGoal = async (req, res) => {
  try {
    const organization = req.orgUser.orgId;
    const createdBy = req.user.userId;

    const { employee, goal, keyPerformanceIndicators, targetDate } = req.body;

    if (!employee || !goal || !targetDate) {
      return res.status(400).json({ message: "Required fields missing." });
    }

    const newGoal = await GoalSetting.create({
      organization,
      employee,
      goal,
      keyPerformanceIndicators,
      targetDate,
      createdBy
    });

    return res.status(201).json({
      message: "Goal created successfully",
      goal: newGoal
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
export const getGoalById = async (req, res) => {
  try {
    const { id } = req.params;
    const organization = req.orgUser.orgId;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid goal ID" });
    }

    const goal = await GoalSetting.findOne({
      _id: id,
      organization
    }).populate("employee", "personalInfo.fullName personalInfo.contact.email");

    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    return res.status(200).json({ message: "Goal fetched successfully", goal });

  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getAllGoals = async (req, res) => {
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

    const total = await GoalSetting.countDocuments(filter);

    const goals = await GoalSetting.find(filter)
      .populate("employee", "personalInfo.fullName personalInfo.contact.email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      message:"goals fetched succesfully",
      goals,
      total,
      totalPages: Math.ceil(total / limit),
      page,
      limit,
      count: goals.length
    });

  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const getEmployeeGoals = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const organization = req.orgUser.orgId;

    logger.info(employeeId);
    if (!mongoose.isValidObjectId(employeeId)) {
      return res.status(400).json({ message: "Invalid employee ID" });
    }
    if(!employeeId){
      return res.status(400).json({ message: "Invalid employee ID" });
    }

    // 691307e66957a1b8c06ba964
    const goals = await GoalSetting.find({
      employee: employeeId,
      organization
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Goals fetched successfully",
      count: goals.length,
       goals
    });

  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getMyGoals = async (req, res) => {
  try {
    const createdBy = req.user.userId;
    const organization = req.orgUser.orgId;
     const { employeeId } = req.params;
    if (!mongoose.isValidObjectId(employeeId)) {
      return res.status(400).json({ message: "Invalid employee ID" });
    }
    if(!employeeId){
      return res.status(400).json({ message: "Invalid employee ID" });
    }
    const goals = await GoalSetting.find({
      employee: employeeId,
      createdBy,
      organization
    }).sort({ createdAt: -1 });

    return res.status(200).json({
        message: "Goals fetched successfully",
      count: goals.length,
       goals
    });

  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const organization = req.orgUser.orgId;

    const updates = req.body;

    const goal = await GoalSetting.findOneAndUpdate(
      { _id: id, organization },
      updates,
      { new: true }
    );

    if (!goal) {
      return res.status(404).json({ message: "Goal not found or unauthorized" });
    }

    return res.status(200).json({
      message: "Goal updated successfully",
       goal
    });

  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const organization = req.orgUser.orgId;

    const goal = await GoalSetting.findOneAndDelete({
      _id: id,
      organization
    });

    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    return res.status(200).json({
      message: "Goal deleted successfully"
    });

  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
