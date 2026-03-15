import mongoose, { Schema } from "mongoose";

const GlobalInventorySnapshotSchema = new Schema(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    skuId: { type: Schema.Types.ObjectId, ref: "SCMSKU", required: true },
    totalAvailable: { type: Number, default: 0 },
    totalReserved: { type: Number, default: 0 },
    warehouseBreakdown: [
      {
        warehouseId: { type: Schema.Types.ObjectId, ref: "SCMWarehouse" },
        warehouseName: { type: String, trim: true },
        available: { type: Number, default: 0 },
        reserved: { type: Number, default: 0 },
      },
    ],
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

GlobalInventorySnapshotSchema.index({ organizationId: 1, skuId: 1 }, { unique: true });

export const GlobalInventorySnapshot = mongoose.model(
  "SCMGlobalInventorySnapshot",
  GlobalInventorySnapshotSchema
);

