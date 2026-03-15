import mongoose, { Schema } from "mongoose";

const ProductSchema = new Schema(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    categoryId: { type: Schema.Types.ObjectId, ref: "SCMCategory" },
    brand: { type: String, trim: true },
    unitOfMeasure: { type: String, trim: true },
    tags: [{ type: String, trim: true }],
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

ProductSchema.index({ organizationId: 1, categoryId: 1 });
ProductSchema.index({ organizationId: 1, name: 1 });
ProductSchema.index({ organizationId: 1, createdAt: -1 });

export const Product = mongoose.model("SCMProduct", ProductSchema);


