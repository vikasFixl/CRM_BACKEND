import mongoose, { Schema } from "mongoose";

const ModulePermissionSchema = new Schema(
  {
    module: { type: String, required: true }, // e.g. 'dashboard', 'hr', 'analytics'
    permissions: [{ type: String }], // e.g. ['view', 'create']
  },
  { _id: false }
);

const BillingPlanSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    code: { type: String, required: true, unique: true },
    description: { type: String },

    price: { type: Number, required: true, min: 0 },
    billingCycle: {
      type: String,
      enum: ["lifetime", "monthly", "quarterly", "yearly"],
      required: true,
      default: "lifetime",
    },
    maxUsers: { type: Number, default: null },
    maxStorageGB: { type: Number, default: null },
    trialDays: { type: Number, default: 0 },
    features: { type: [String], default: [] },
    permissions: { type: [ModulePermissionSchema], default: [] },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export const BillingPlan = mongoose.model("BillingPlan", BillingPlanSchema);
