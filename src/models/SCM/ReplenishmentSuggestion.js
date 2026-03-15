import mongoose, { Schema } from "mongoose";

const ReplenishmentSuggestionSchema = new Schema(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    skuId: { type: Schema.Types.ObjectId, ref: "SCMSKU", required: true },
    recommendedQty: { type: Number, required: true, min: 1 },
    vendorId: { type: Schema.Types.ObjectId, ref: "SCMVendor" },
    status: {
      type: String,
      enum: ["generated", "approved", "rejected", "converted_to_po"],
      default: "generated",
      required: true,
    },
    reason: { type: String, trim: true },
    forecastId: { type: Schema.Types.ObjectId, ref: "SCMDemandForecast" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

ReplenishmentSuggestionSchema.index({ organizationId: 1, skuId: 1, status: 1 });
ReplenishmentSuggestionSchema.index({ organizationId: 1, createdAt: -1 });

export const ReplenishmentSuggestion = mongoose.model(
  "SCMReplenishmentSuggestion",
  ReplenishmentSuggestionSchema
);

