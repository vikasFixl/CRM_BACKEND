import mongoose, { Schema } from "mongoose";

const DemandForecastSchema = new Schema(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    skuId: { type: Schema.Types.ObjectId, ref: "SCMSKU", required: true },
    period: { type: String, required: true, trim: true },
    forecastQuantity: { type: Number, required: true, min: 0 },
    confidenceScore: { type: Number, min: 0, max: 1, default: 0.5 },
    generatedAt: { type: Date, default: Date.now },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

DemandForecastSchema.index({ organizationId: 1, skuId: 1, period: 1 }, { unique: true });
DemandForecastSchema.index({ organizationId: 1, generatedAt: -1 });

export const DemandForecast = mongoose.model("SCMDemandForecast", DemandForecastSchema);

