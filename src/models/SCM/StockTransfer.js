import mongoose, { Schema } from "mongoose";

const StockTransferSchema = new Schema(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    skuId: { type: Schema.Types.ObjectId, ref: "SCMSKU", required: true },
    sourceWarehouseId: {
      type: Schema.Types.ObjectId,
      ref: "SCMWarehouse",
      required: true,
    },
    destinationWarehouseId: {
      type: Schema.Types.ObjectId,
      ref: "SCMWarehouse",
      required: true,
    },
    quantity: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: ["requested", "approved", "in_transit", "completed"],
      default: "requested",
      required: true,
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

StockTransferSchema.index({ organizationId: 1, skuId: 1 });
StockTransferSchema.index({ organizationId: 1, status: 1 });
StockTransferSchema.index({ organizationId: 1, sourceWarehouseId: 1 });
StockTransferSchema.index({ organizationId: 1, destinationWarehouseId: 1 });

export const StockTransfer = mongoose.model("SCMStockTransfer", StockTransferSchema);

