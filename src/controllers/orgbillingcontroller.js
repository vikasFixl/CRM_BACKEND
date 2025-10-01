import Org from "../models/OrgModel.js";
import { BillingPlan } from "../models/BillingPlanModel.js";
import { OrganizationBilling } from "../models/OranizationBillingPlanModel.js";


export const startTrial = async (req, res) => {
  try {
    const orgId = req.orgUser.orgId; // make sure middleware sets orgUser
    const { planId } = req.body;

    const org = await Org.findById(orgId);
    if (!org) return res.status(404).json({ message: "Organization not found" });

    const plan = await BillingPlan.findById(planId);
    if (!plan) return res.status(404).json({ message: "Billing plan not found" });

    // Prevent re-trial of the same plan
    if (org.trials?.includes(plan._id.toString())) {
      return res.status(400).json({ message: "Organization already used this trial" });
    }

    // Create new billing for trial
    const trialEndDate = new Date(Date.now() + (plan.trialDays || 14) * 24 * 60 * 60 * 1000);

    const newBilling = new OrganizationBilling({
      organizationId: org._id,
      billingPlanId: plan._id,
      planSnapshot: {
        name: plan.name,
        code: plan.code,
        planType: plan.planType,
        price: 0,
        billingCycle: plan.pricing[0]?.billingCycle || "monthly",
        features: plan.features.map(f => f.title),
        limits: plan.limits,
      },
      paymentStatus: "trialing",
      trialEndDate,
      createdBy: req.user.userId,
      updatedBy: req.user.userId,
    });

    await newBilling.save();

    // Set as current billing
    org.currentBilling = newBilling._id;
    org.trials = [...(org.trials || []), plan._id.toString()];
    await org.save();

    res.status(201).json({ message: "Trial started successfully", billing: newBilling });
  } catch (error) {
    console.error("Start trial error:", error);
    res.status(500).json({ message: "Failed to start trial", error: error.message });
  }
};

/**
 * Upgrade or downgrade a plan
 */
export const changePlan = async (req, res) => {
  try {
    const orgId = req.orgUser.orgId;
    const { planId } = req.body;

    const org = await Org.findById(orgId);
    if (!org) return res.status(404).json({ message: "Organization not found" });

    const plan = await BillingPlan.findById(planId);
    if (!plan) return res.status(404).json({ message: "Billing plan not found" });

    const billing = await OrganizationBilling.findById(org.currentBilling);
    if (!billing) return res.status(404).json({ message: "Current billing not found" });

    // Snapshot new plan
    billing.billingPlanId = plan._id;
    billing.planSnapshot = {
      name: plan.name,
      code: plan.code,
      planType: plan.planType,
      price: plan.pricing[0]?.price || 0,
      billingCycle: plan.pricing[0]?.billingCycle || "monthly",
      features: plan.features.map(f => f.title),
      limits: plan.limits,
    };
    billing.paymentStatus = "active";
    billing.updatedBy = req.user.userId;

    await billing.save();

    res.status(200).json({ message: "Plan changed successfully", billing });
  } catch (error) {
    console.error("Change plan error:", error);
    res.status(500).json({ message: "Failed to change plan", error: error.message });
  }
};

/**
 * Cancel subscription
 */
export const cancelSubscription = async (req, res) => {
  try {
    const orgId = req.orgUser.orgId;

    const org = await Org.findById(orgId);
    if (!org) return res.status(404).json({ message: "Organization not found" });

    const billing = await OrganizationBilling.findById(org.currentBilling);
    if (!billing) return res.status(404).json({ message: "Current billing not found" });

    billing.paymentStatus = "canceled";
    billing.subscriptionEndDate = new Date();
    billing.updatedBy = req.user.userId;

    await billing.save();

    res.status(200).json({ message: "Subscription canceled", billing });
  } catch (error) {
    console.error("Cancel subscription error:", error);
    res.status(500).json({ message: "Failed to cancel subscription", error: error.message });
  }
};



/**
 * Check trial status
 */
export const checkTrialStatus = async (req, res) => {
  try {
    const orgId = req.orgUser.orgId;
    const billing = await OrganizationBilling.findById((await Org.findById(orgId)).currentBilling);

    if (!billing) return res.status(404).json({ message: "Current billing not found" });

    if (billing.paymentStatus !== "trialing") {
      return res.status(200).json({ trialing: false });
    }

    const now = new Date();
    const expired = billing.trialEndDate < now;

    res.status(200).json({
      trialing: !expired,
      expired,
      trialEndDate: billing.trialEndDate,
    });
  } catch (error) {
    console.error("Check trial error:", error);
    res.status(500).json({ message: "Failed to check trial status", error: error.message });
  }
};

/**
 * Automations (cron)
 * - Check trial expiry daily
 * - Downgrade to FREE if trial expired
 */
export const processTrialExpirations = async () => {
  try {
    const now = new Date();
    const expiringTrials = await OrganizationBilling.find({
      paymentStatus: "trialing",
      trialEndDate: { $lte: now },
    });

    for (const billing of expiringTrials) {
      const org = await Org.findById(billing.organizationId);
      const freePlan = await BillingPlan.findOne({ code: "FREE" });
      if (!freePlan) continue;

      // Downgrade billing to FREE
      billing.billingPlanId = freePlan._id;
      billing.planSnapshot = {
        name: freePlan.name,
        code: freePlan.code,
        planType: freePlan.planType,
        price: 0,
        billingCycle: freePlan.pricing[0]?.billingCycle || "monthly",
        features: freePlan.features.map(f => f.title),
        limits: freePlan.limits,
      };
      billing.paymentStatus = "active";
      billing.trialEndDate = null;
      billing.updatedBy = org.updatedBy || null;

      await billing.save();

      // Update org currentBilling
      org.currentBilling = billing._id;
      await org.save();
    }
  } catch (error) {
    console.error("Process trial expirations error:", error);
  }
};

export const getCurrentPlanDetails = async (req, res) => {
  try {
    const orgId = req.orgUser.orgId;
    console.log("orgId", orgId);

    // Populate the current billing reference
    const organization = await Org.findById(orgId)
      .populate({
        path: "currentBilling",
        populate: { path: "billingPlanId" }, // optional: populate the plan template
      })
      .lean();

    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    if (!organization.currentBilling) {
      return res.status(404).json({ message: "Current billing info not found" });
    }

    const currentBilling = organization.currentBilling;

    res.status(200).json({
      message: "Current organization plan fetched successfully",
      currentPlan: currentBilling,
      billingPlanTemplate: currentBilling.billingPlanId || null, // optional
    });
  } catch (error) {
    console.error("Error fetching current plan:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

export const getBillingHistory = async (req, res) => {
  try {
    const orgId = req.orgUser.orgId;

    const organization = await Org.findById(orgId);
    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }
    const billingHistories = await OrganizationBilling.find({
      organizationId: orgId,
    })
      .populate("billingPlanId", "name code planType") // populate plan details
      .sort({ createdAt: -1 }) // latest first
      .lean();

    res.status(200).json({
      message: "Billing history fetched successfully",
      billingHistories,
    });
  } catch (error) {
    console.error("Error fetching billing history:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};