import mongoose, { Schema } from "mongoose";

const VariantImageSchema = new Schema(
  {
    url: { type: String, required: true, trim: true },
    publicId: { type: String, required: true, trim: true },
    alt: { type: String, trim: true },
    isPrimary: { type: Boolean, default: false },
  },
  { _id: false }
);

const ProductVariantSchema = new Schema(
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
    name: { type: String, required: true, trim: true },
    color: { type: String, trim: true },
    images: { type: [VariantImageSchema], default: [] },
    attributes: { type: Map, of: String },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

ProductVariantSchema.index({ organizationId: 1, productId: 1 });
ProductVariantSchema.index({ organizationId: 1, createdAt: -1 });

export const ProductVariant = mongoose.model("SCMProductVariant", ProductVariantSchema);


