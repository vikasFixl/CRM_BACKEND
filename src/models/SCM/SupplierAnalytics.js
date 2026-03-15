import mongoose, { Schema } from "mongoose";

const SupplierAnalyticsSchema = new Schema(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    vendorId: { type: Schema.Types.ObjectId, ref: "SCMVendor", required: true },
    period: { type: String, required: true, trim: true },
    totalOrders: { type: Number, default: 0 },
    onTimeDeliveries: { type: Number, default: 0 },
    lateDeliveries: { type: Number, default: 0 },
    averageLeadTime: { type: Number, default: 0 },
    defectRate: { type: Number, default: 0 },
    fulfillmentRate: { type: Number, default: 0 },
    performanceScore: { type: Number, default: 0 },
    generatedAt: { type: Date, default: Date.now },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

SupplierAnalyticsSchema.index({ organizationId: 1, vendorId: 1, period: 1 }, { unique: true });
SupplierAnalyticsSchema.index({ organizationId: 1, generatedAt: -1 });

export const SupplierAnalytics = mongoose.model(
  "SCMSupplierAnalytics",
  SupplierAnalyticsSchema
);

