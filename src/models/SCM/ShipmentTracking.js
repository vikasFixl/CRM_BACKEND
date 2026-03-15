import mongoose, { Schema } from "mongoose";

const ShipmentTrackingSchema = new Schema(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    shipmentId: { type: Schema.Types.ObjectId, ref: "SCMShipment", required: true },
    carrier: { type: String, trim: true },
    trackingNumber: { type: String, trim: true },
    status: {
      type: String,
      enum: [
        "dispatched",
        "in_transit",
        "out_for_delivery",
        "delivered",
        "delayed",
        "exception",
      ],
      required: true,
    },
    location: { type: String, trim: true },
    timestamp: { type: Date, default: Date.now },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

ShipmentTrackingSchema.index({ organizationId: 1, shipmentId: 1, timestamp: -1 });
ShipmentTrackingSchema.index({ organizationId: 1, trackingNumber: 1 });

export const ShipmentTracking = mongoose.model(
  "SCMShipmentTracking",
  ShipmentTrackingSchema
);

