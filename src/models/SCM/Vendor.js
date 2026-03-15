import mongoose, { Schema } from "mongoose";

const VendorSchema = new Schema(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    vendorCode: { type: String, trim: true, uppercase: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    taxId: { type: String, trim: true },
    address: {
      line1: { type: String, trim: true },
      line2: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      postalCode: { type: String, trim: true },
      country: { type: String, trim: true },
    },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

VendorSchema.index({ organizationId: 1, name: 1 });
VendorSchema.index({ organizationId: 1, vendorCode: 1 });
VendorSchema.index({ organizationId: 1, createdAt: -1 });

export const Vendor = mongoose.model("SCMVendor", VendorSchema);


