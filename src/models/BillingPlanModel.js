import mongoose from "mongoose";

const { Schema } = mongoose;

const PricingSchema = new Schema(
  {
    currency: {
      type: String,
      required: [true, "Currency is required"],
      uppercase: true,
      trim: true,
      match: [/^[A-Z]{3}$/, "Currency must be a valid 3-letter ISO code (e.g., USD, INR)"],
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount cannot be negative"],
    },
    strikethroughAmount: {
      type: Number,
      min: [0, "Strikethrough amount cannot be negative"],
      validate: {
        validator: function (val) {
          return val == null || val > this.amount; // discount must make sense
        },
        message: "Strikethrough amount must be greater than base amount",
      },
    },
    billingCycle: {
      type: String,
      enum: {
        values: ["monthly", "quarterly", "yearly"],
        message: "Billing cycle must be monthly, quarterly, or yearly",
      },
      default: "monthly",
    },
  },
  { _id: false }
);

const FeatureSchema = new Schema(
  {
    title: { type: String, required: [true, "Feature title is required"], trim: true },
    description: { type: String, trim: true },
    isHighlight: { type: Boolean, default: false },
    isAddOn: { type: Boolean, default: false },
  },
  { _id: false }
);

const TrialSchema = new Schema(
  {
    isTrialAvailable: { type: Boolean, default: false },
    trialDays: {
      type: Number,
      default: 0,
      min: [0, "Trial days cannot be negative"],
      max: [90, "Trial days cannot exceed 90"], // sanity limit
    },
  },
  { _id: false }
);

const PlanSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Plan name is required"],
      unique: true,
      trim: true,
      minlength: [3, "Plan name must be at least 3 characters"],
      maxlength: [50, "Plan name cannot exceed 50 characters"],
    },
    code: {
      type: String,
      required: [true, "Plan code is required"],
      unique: true,
      uppercase: true,
      trim: true,
      minlength: [2, "Plan code must be at least 2 characters"],
      maxlength: [20, "Plan code cannot exceed 20 characters"],
    },
    description: { type: String, trim: true, maxlength: 500 },
    planType: {
      type: String,
      enum: ["FREE", "BASIC", "PRO", "ENTERPRISE"],
      required: [true, "Plan type is required"],
    },
    pricing: {
      type: [PricingSchema],
      validate: {
        validator: (val) => val.length > 0,
        message: "At least one pricing option is required",
      },
    },
    features: {
      type: [FeatureSchema],
      validate: {
        validator: (val) => val.length > 0,
        message: "At least one feature is required",
      },
    },
  modules: [
  {
    code: { type: String, uppercase: true }, // HRM, CRM
    included: { type: Boolean, default: true }
  }
]
,

    limits: {
      maxUsers: { type: Number, min: 1, default: null },
      maxProjects: { type: Number, min: 1, default: null },
      maxProjectMembers: { type: Number, min: 1, default: null },
      maxStorageGB: { type: Number, min: 1, default: null },
    },

    trial: TrialSchema,

    isActive: { type: Boolean, default: true },
    isFreePlan: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },

    regionRestrictions: [{ type: String, uppercase: true, trim: true }],
    tags: [{ type: String, trim: true }],

    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);



export const BillingPlan = mongoose.model("BillingPlan", PlanSchema);
