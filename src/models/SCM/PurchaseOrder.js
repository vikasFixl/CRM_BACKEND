import mongoose, { Schema } from "mongoose";

const PurchaseOrderItemSchema = new Schema(
  {
    skuId: { type: Schema.Types.ObjectId, ref: "SCMSKU", required: true },
    productId: { type: Schema.Types.ObjectId, ref: "SCMProduct" },
    variantId: { type: Schema.Types.ObjectId, ref: "SCMProductVariant" },
    quantity: { type: Number, required: true, min: 1 },
    receivedQuantity: { type: Number, min: 0, default: 0 },
    unitPrice: { type: Number, min: 0, default: 0 },
    total: { type: Number, min: 0, default: 0 },
  },
  { _id: false }
);

const PurchaseOrderSchema = new Schema(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: "SCMVendor",
      required: true,
    },
    warehouseId: { type: Schema.Types.ObjectId, ref: "SCMWarehouse" },
    orderNumber: { type: String, required: true, trim: true, uppercase: true },
    status: {
      type: String,
      enum: ["draft", "approved", "sent", "received", "cancelled"],
      default: "draft",
      required: true,
    },
    orderDate: { type: Date, default: Date.now },
    expectedDeliveryDate: { type: Date },
    items: { type: [PurchaseOrderItemSchema], default: [] },
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

PurchaseOrderSchema.index({ organizationId: 1, orderNumber: 1 }, { unique: true });
PurchaseOrderSchema.index({ organizationId: 1, vendorId: 1 });
PurchaseOrderSchema.index({ organizationId: 1, createdAt: -1 });

export const PurchaseOrder = mongoose.model("SCMPurchaseOrder", PurchaseOrderSchema);


