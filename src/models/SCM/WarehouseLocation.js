import mongoose, { Schema } from "mongoose";

const WarehouseLocationSchema = new Schema(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    warehouseId: {
      type: Schema.Types.ObjectId,
      ref: "SCMWarehouse",
      required: true,
    },
    locationCode: { type: String, required: true, trim: true, uppercase: true },
    description: { type: String, trim: true },
    zone: { type: String, trim: true },
    aisle: { type: String, trim: true },
    rack: { type: String, trim: true },
    bin: { type: String, trim: true },
    capacity: { type: Number, min: 0, default: 0 },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

WarehouseLocationSchema.index(
  { organizationId: 1, warehouseId: 1, locationCode: 1 },
  { unique: true }
);
WarehouseLocationSchema.index({ organizationId: 1, warehouseId: 1 });
WarehouseLocationSchema.index({ organizationId: 1, createdAt: -1 });

export const WarehouseLocation = mongoose.model(
  "WarehouseLocation",
  WarehouseLocationSchema
);


