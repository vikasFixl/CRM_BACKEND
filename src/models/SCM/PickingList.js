import mongoose, { Schema } from "mongoose";

const PickingListItemSchema = new Schema(
  {
    skuId: { type: Schema.Types.ObjectId, ref: "SCMSKU", required: true },
    locationId: {
      type: Schema.Types.ObjectId,
      ref: "SCMWarehouseLocation",
      required: true,
    },
    quantity: { type: Number, required: true, min: 1 },
    pickedQuantity: { type: Number, min: 0, default: 0 },
  },
  { _id: false }
);

const PickingListSchema = new Schema(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    orderId: { type: Schema.Types.ObjectId, ref: "SCMOrder", required: true },
    warehouseId: { type: Schema.Types.ObjectId, ref: "SCMWarehouse", required: true },
    pickerId: { type: Schema.Types.ObjectId, ref: "User" },
    status: {
      type: String,
      enum: ["pending", "assigned", "picking", "completed"],
      default: "pending",
      required: true,
    },
    items: { type: [PickingListItemSchema], default: [] },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

PickingListSchema.index({ organizationId: 1, orderId: 1 });
PickingListSchema.index({ organizationId: 1, warehouseId: 1 });
PickingListSchema.index({ organizationId: 1, status: 1 });

export const PickingList = mongoose.model("SCMPickingList", PickingListSchema);

