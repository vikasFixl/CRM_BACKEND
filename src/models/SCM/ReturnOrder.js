import mongoose, { Schema } from "mongoose";

const ReturnItemSchema = new Schema(
  {
    skuId: { type: Schema.Types.ObjectId, ref: "SCMSKU", required: true },
    productId: { type: Schema.Types.ObjectId, ref: "SCMProduct" },
    variantId: { type: Schema.Types.ObjectId, ref: "SCMProductVariant" },
    quantity: { type: Number, required: true, min: 1 },
    condition: { type: String, trim: true },
  },
  { _id: false }
);

const ReturnOrderSchema = new Schema(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    orderId: { type: Schema.Types.ObjectId, ref: "SCMOrder", required: true },
    items: { type: [ReturnItemSchema], default: [] },
    reason: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["requested", "approved", "received", "rejected", "restocked"],
      default: "requested",
      required: true,
    },
    requestedAt: { type: Date, default: Date.now },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

ReturnOrderSchema.index({ organizationId: 1, orderId: 1 });
ReturnOrderSchema.index({ organizationId: 1, status: 1 });
ReturnOrderSchema.index({ organizationId: 1, createdAt: -1 });

export const ReturnOrder = mongoose.model("SCMReturnOrder", ReturnOrderSchema);


