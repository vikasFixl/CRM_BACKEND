import { BillingPlan } from "../models/BillingPlanModel.js";

// Create a new billing plan
export const createBillingPlan = async (req, res) => {
  try {
    const { name, code, description, price, billingCycle, maxUsers, maxStorageGB, trialDays, features, permissions } = req.body;
    console.log(req.body);

    const billingPlan = new BillingPlan({
      name, 
      code, 
      description, 
      price, 
      billingCycle, 
      maxUsers, 
      maxStorageGB, 
      trialDays, 
      features, 
      permissions,
      createdBy: req.user.userId,
      updatedBy: req.user.userId
    });
    console.log(billingPlan);
    await billingPlan.save();
    res.status(201).json({ success: true, message: "Billing plan created successfully", data: billingPlan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all billing plans
export const getAllBillingPlans = async (req, res) => {
  try {
    const billingPlans = await BillingPlan.find();
    res.status(200).json({ success: true, data: billingPlans });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get a single billing plan by ID
export const getBillingPlanById = async (req, res) => {
  try {
    const { id } = req.params;
    const billingPlan = await BillingPlan.findById(id);
    if (!billingPlan) {
      return res.status(404).json({ success: false, message: "Billing plan not found" });
    }
    res.status(200).json({ success: true, data: billingPlan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update a billing plan
export const updateBillingPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;
    const billingPlan = await BillingPlan.findByIdAndUpdate(id, updatedData, { new: true });
    if (!billingPlan) {
      return res.status(404).json({ success: false, message: "Billing plan not found" });
    }
    res.status(200).json({ success: true, message: "Billing plan updated successfully", data: billingPlan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a billing plan
export const deleteBillingPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const billingPlan = await BillingPlan.findByIdAndDelete(id);
    if (!billingPlan) {
      return res.status(404).json({ success: false, message: "Billing plan not found" });
    }
    res.status(200).json({ success: true, message: "Billing plan deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
