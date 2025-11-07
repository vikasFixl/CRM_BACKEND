import mongoose from "mongoose";
const { Schema, model } = mongoose;

const assetSchema = new Schema(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    assetName: { type: String, required: true, trim: true },
    assetType: {
      type: String,
      enum: ["Laptop", "Mobile", "Monitor", "Chair", "Other"],
      required: true,
    },
    serialNumber: { type: String, required: true },
    condition: {
      type: String,
      enum: ["New", "Good", "Needs Repair", "Retired"],
      default: "Good",
    },
    status: {
      type: String,
      enum: ["Available", "Assigned", "Lost", "Damaged", "Retired"],
      default: "Available",
      index: true,
    },
    purchaseDate:{
      type: Date,
      default: Date.now()
    },
    cost: Number,
    notes: String,
  },
  { timestamps: true }
);

// Unique serial per organization
assetSchema.index({ serialNumber: 1, organizationId: 1 }, { unique: true });

const Asset = mongoose.model("Asset", assetSchema);
export default Asset;
