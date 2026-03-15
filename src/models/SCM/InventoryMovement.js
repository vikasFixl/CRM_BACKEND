import mongoose, { Schema } from "mongoose";

const InventoryMovementSchema = new Schema(
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
    movementType: {
      type: String,
      enum: [
        "PURCHASE",
        "SALE",
        "TRANSFER",
        "TRANSFER_OUT",
        "TRANSFER_IN",
        "RETURN",
        "ADJUSTMENT",
      ],
      required: true,
    },
    quantity: { type: Number, required: true },
    referenceId: { type: Schema.Types.ObjectId },
    referenceType: { type: String, trim: true },
    note: { type: String, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

InventoryMovementSchema.index({ organizationId: 1, skuId: 1, createdAt: -1 });
InventoryMovementSchema.index({
  organizationId: 1,
  warehouseId: 1,
  createdAt: -1,
});
InventoryMovementSchema.index({ organizationId: 1, createdAt: -1 });

export const InventoryMovement = mongoose.model(
  "InventoryMovement",
  InventoryMovementSchema
);


