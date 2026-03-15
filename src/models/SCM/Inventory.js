import mongoose, { Schema } from "mongoose";

const InventorySchema = new Schema(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    skuId: {
      type: Schema.Types.ObjectId,
      ref: "SCMSKU",
      required: true,
    },
    warehouseId: {
      type: Schema.Types.ObjectId,
      ref: "SCMWarehouse",
      required: true,
    },
    warehouseLocationId: {
      type: Schema.Types.ObjectId,
      ref: "SCMWarehouseLocation",
    },
    quantityAvailable: { type: Number, min: 0, default: 0 },
    quantityReserved: { type: Number, min: 0, default: 0 },
    reorderLevel: { type: Number, min: 0, default: 0 },
    lastCountedAt: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

InventorySchema.index(
  { organizationId: 1, skuId: 1, warehouseId: 1 },
  { unique: true }
);
InventorySchema.index({ organizationId: 1, skuId: 1 });
InventorySchema.index({ organizationId: 1, warehouseId: 1 });
InventorySchema.index({ organizationId: 1, createdAt: -1 });

export const Inventory = mongoose.model("SCMInventory", InventorySchema);


