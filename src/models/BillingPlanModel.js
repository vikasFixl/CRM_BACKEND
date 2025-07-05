import mongoose, { Schema } from "mongoose";

const BillingPlanSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },
    billingCycle: {
      type: String,
      enum: ["lifetime", "monthly", "quarterly", "yearly"],
      required: true,
      default: "lifetime",
    },

    // Usage limits
    maxUsers: {
      type: Number,
      default: null, // Unlimited if null
    },
    maxProjects: {
      type: Number,
      default: 5,
    },
    maxProjectMembers: {
      type: Number,
      default: 10,
    },
    maxStorageGB: {
      type: Number,
      default: null,
    },
    trialDays: {
      type: Number,
      default: 0,
    },

    // ✅ Module access (no permissions here)
    modules: {
      type: [String],
      default: [],
      required: true,
      enum: [
        "dashboard",
        "organization",
        "users",
        "roles",
        "permissions",
        "clients",
        "leads",
        "invoices",
        "projects",
        "tasks",
        "analytics",
        "automation",
        "notifications",
        "tax",
        "settings",
        "firm",
        "crm",
        "timeTracking",
        "reporting",
      ],
    },

    // Metadata
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const BillingPlan = mongoose.model("BillingPlan", BillingPlanSchema);
