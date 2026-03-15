import mongoose, { Schema } from "mongoose";

const OrderItemSchema = new Schema(
  {
    skuId: { type: Schema.Types.ObjectId, ref: "SCMSKU", required: true },
    productId: { type: Schema.Types.ObjectId, ref: "SCMProduct" },
    variantId: { type: Schema.Types.ObjectId, ref: "SCMProductVariant" },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, min: 0, default: 0 },
    total: { type: Number, min: 0, default: 0 },
  },
  { _id: false }
);

const OrderSchema = new Schema(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    orderNumber: { type: String, required: true, trim: true, uppercase: true },
    status: {
      type: String,
      enum: [
        "created",
        "confirmed",
        "picking",
        "packed",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "created",
      required: true,
    },
    customerId: { type: Schema.Types.ObjectId, ref: "ClientModel" },
    warehouseId: { type: Schema.Types.ObjectId, ref: "SCMWarehouse" },
    orderDate: { type: Date, default: Date.now },
    items: { type: [OrderItemSchema], default: [] },
    currency: { type: String, trim: true, uppercase: true, default: "USD" },
    subtotal: { type: Number, min: 0, default: 0 },
    tax: { type: Number, min: 0, default: 0 },
    discount: { type: Number, min: 0, default: 0 },
    total: { type: Number, min: 0, default: 0 },
    notes: { type: String, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

OrderSchema.index({ organizationId: 1, orderNumber: 1 }, { unique: true });
OrderSchema.index({ organizationId: 1, status: 1 });
OrderSchema.index({ organizationId: 1, createdAt: -1 });

export const Order = mongoose.model("SCMOrder", OrderSchema);


