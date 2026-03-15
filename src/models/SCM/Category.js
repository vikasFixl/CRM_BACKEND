import mongoose, { Schema } from "mongoose";

const CategorySchema = new Schema(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true, uppercase: true },
    description: { type: String, trim: true },
    parentId: { type: Schema.Types.ObjectId, ref: "SCMCategory" },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

CategorySchema.index({ organizationId: 1, code: 1 }, { unique: true });
CategorySchema.index({ organizationId: 1, name: 1 });
CategorySchema.index({ organizationId: 1, createdAt: -1 });

export const Category = mongoose.model("SCMCategory", CategorySchema);


