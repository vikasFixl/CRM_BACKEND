import { BillingPlan } from "../models/BillingPlanModel.js";
import { BillingPlanValidator } from "../validations/billing/billing.js";
export const createPlan = async (req, res, next) => {
  try {
    const body = BillingPlanValidator.parse(req.body);

    const existingPlan = await BillingPlan.findOne({ code: body.code,name: body.name });
    if(existingPlan){
      return res.status(400).json({ success: false, message: "name and code already exists" });
    }
    const plan = await BillingPlan.create({
      ...body,
      createdBy: req.user?._id, // assuming auth middleware
    });

    res.status(201).json({ success: true, message: "Plan created successfully"});
  } catch (err) {
    next(err);
  }
};

// ✅ Get all plans
export const getAllPlans = async (req, res, next) => {
  try {
    const { currency } = req.query; // e.g. ?currency=USD

    let plans = [];

    if (currency) {
      // Only return active plans with that currency
      plans = await BillingPlan.aggregate([
        { $match: { isActive: true } },
        { $unwind: "$pricing" },
        { $match: { "pricing.currency": currency } },
        {
          $group: {
            _id: "$_id",
            name: { $first: "$name" },
            description: { $first: "$description" },
            features: { $first: "$features" },
            pricing: { $push: "$pricing" }
          }
        }
      ]);
    } else {
      // No currency -> explicitly return empty array
      plans = [];
    }

    res.status(200).json({ success: true, plans });
  } catch (err) {
    next(err);
  }
};


// ✅ Get plan by ID
export const getPlanById = async (req, res, next) => {
  try {
    const planId= req.params.id
    const plan = await BillingPlan.findOne({ _id: planId,isActive: true }).lean();
    if (!plan) return res.status(404).json({ success: false, message: "Plan not found" });

    res.status(200).json({ success: true, data: plan });
  } catch (err) {
    next(err);
  }
};

// ✅ Update plan
export const updatePlan = async (req, res, next) => {
  try {
    const body = BillingPlanValidator.partial().parse(req.body);

    const plan = await BillingPlan.findByIdAndUpdate(
      req.params.id,
      { ...body, updatedBy: req.user?._id },
      { new: true, runValidators: true }
    );

    if (!plan) return res.status(404).json({ success: false, message: "Plan not found" });

    res.status(200).json({ success: true, data: plan });
  } catch (err) {
    next(err);
  }
};

// ✅ Delete plan


// ✅ Activate plan
export const activatePlan = async (req, res, next) => {
  try {
    const plan = await BillingPlan.findByIdAndUpdate(
      req.params.id,
      { isActive: true },
      { new: true }
    );

    if (!plan) return res.status(404).json({ success: false, message: "Plan not found" });

    res.status(200).json({ success: true, message: "Plan activated successfully"});
  } catch (err) {
    next(err);
  }
};

// ✅ Deactivate plan
export const deactivatePlan = async (req, res, next) => {
  try {
  const plan = await BillingPlan.findOneAndUpdate(
  {
    _id: req.params.id,
    isActive: true,           // must be active
    planType: { $ne: "FREE" }    // not the free/basic plan
  },
  { isActive: false },
  { new: true }
);

if (!plan) {
  return res.status(400).json({
    success: false,
    message: "Plan cannot be deactivated. Either it is already inactive or it's the basic/free plan."
  });
}

    res.status(200).json({ success: true,message: "Plan deactivated successfully"});
  } catch (err) {
    next(err);
  }
};

