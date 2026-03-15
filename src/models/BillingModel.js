import mongoose, { Schema } from "mongoose";

const ModulePricingSchema = new Schema(
  {
    currency: { type: String, uppercase: true, required: true },
    amount: { type: Number, min: 0, required: true },
    billingCycle: {
      type: String,
      enum: ["monthly", "quarterly", "yearly"],
      default: "monthly"
    }
  },
  { _id: false }
);

const ModuleSchema = new Schema(
  {
    name: { type: String, required: true }, // "HRM"
    code: { type: String, required: true, uppercase: true }, // "HRM"
    description: String,

    pricing: [ModulePricingSchema],

    isAddOn: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },

    dependencies: [{ type: String, uppercase: true }], // e.g. PAYROLL depends on HRM

    createdBy: { type: Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

ModuleSchema.index({ code: 1 }, { unique: true });

export const BillingModule = mongoose.model("BillingModule", ModuleSchema);
