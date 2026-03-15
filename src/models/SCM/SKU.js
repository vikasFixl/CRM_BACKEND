import mongoose, { Schema } from "mongoose";

const SKUSchema = new Schema(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: "SCMProduct",
      required: true,
    },
    variantId: {
      type: Schema.Types.ObjectId,
      ref: "SCMProductVariant",
      required: true,
    },
    skuCode: { type: String, required: true, trim: true, uppercase: true },
    barcode: { type: String, trim: true },
    name: { type: String, trim: true },
    attributes: { type: Map, of: String },
    unitPrice: { type: Number, min: 0, default: 0 },
    costPrice: { type: Number, min: 0, default: 0 },
    currency: { type: String, trim: true, uppercase: true, default: "USD" },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

SKUSchema.index({ organizationId: 1, skuCode: 1 }, { unique: true });
SKUSchema.index({ organizationId: 1, productId: 1 });
SKUSchema.index({ organizationId: 1, variantId: 1 });
SKUSchema.index({ organizationId: 1, createdAt: -1 });

export const SKU = mongoose.model("SCMSKU", SKUSchema);


