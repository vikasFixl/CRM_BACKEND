import mongoose, { Schema } from "mongoose";

const PlanSnapshotSchema = new Schema({
  name: { type: String, required: true },
  code: { type: String, required: true },
  planType: { type: String, enum: ["FREE", "BASIC", "PRO", "ENTERPRISE"], required: true },
  price: { type: Number, min: 0, required: true },
  billingCycle: { type: String, enum: ["monthly", "quarterly", "yearly"], required: true },
  currency: { type: String, required: true, uppercase: true, trim: true },
  features: [{ type: String }],
  limits: Schema.Types.Mixed,
}, { _id: false });

const BillingHistorySchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    billingPlanId: { type: Schema.Types.ObjectId, ref: "BillingPlan" },
    planSnapshot: { type: PlanSnapshotSchema, required: true },
    action: {
      type: String,
      enum: [
        "free_plan",
        "trial_started",
        "trial_ended",
        "subscribed",
        "upgraded",
        "downgraded",
        "renewed",
        "payment_success",
        "payment_failed",
        "canceled",
      ],
      required: true,
    },
    amount: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: "USD", uppercase: true, trim: true },
    paymentMethod: { type: String }, // e.g., credit_card, paypal
    paymentRef: { type: String, index: true },
    effectiveDate: { type: Date, default: Date.now },
    metadata: { type: Map, of: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export const BillingHistory = mongoose.model("BillingHistory", BillingHistorySchema);
