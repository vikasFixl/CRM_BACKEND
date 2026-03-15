import mongoose, { Schema } from "mongoose";

const ShipmentSchema = new Schema(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    orderId: { type: Schema.Types.ObjectId, ref: "SCMOrder", required: true },
    warehouseId: {
      type: Schema.Types.ObjectId,
      ref: "SCMWarehouse",
      required: true,
    },
    trackingNumber: { type: String, trim: true },
    carrier: { type: String, trim: true },
    status: {
      type: String,
      enum: ["pending", "shipped", "in_transit", "delivered", "cancelled"],
      default: "pending",
      required: true,
    },
    shippedAt: { type: Date },
    deliveredAt: { type: Date },
    notes: { type: String, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

ShipmentSchema.index({ organizationId: 1, orderId: 1 });
ShipmentSchema.index({ organizationId: 1, trackingNumber: 1 });
ShipmentSchema.index({ organizationId: 1, createdAt: -1 });

export const Shipment = mongoose.model("SCMShipment", ShipmentSchema);


