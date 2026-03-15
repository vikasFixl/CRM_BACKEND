import mongoose, { Schema } from "mongoose";

const WarehouseSchema = new Schema(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true, uppercase: true },
    address: {
      line1: { type: String, trim: true },
      line2: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      postalCode: { type: String, trim: true },
      country: { type: String, trim: true },
    },
    isDefault: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

WarehouseSchema.index({ organizationId: 1, code: 1 }, { unique: true });
WarehouseSchema.index({ organizationId: 1, name: 1 });
WarehouseSchema.index({ organizationId: 1, createdAt: -1 });

export const Warehouse = mongoose.model("SCMWarehouse", WarehouseSchema);


