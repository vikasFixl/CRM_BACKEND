import mongoose from "mongoose";
const { Schema, model } = mongoose;

const assetAssignmentSchema = new Schema(
  {
    
    assetId: {
      type: Schema.Types.ObjectId,
      ref: "Asset",
      required: true,
      index: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "EmployeeProfile",
      required: true,
    },
    assignmentDate: { type: Date, default: Date.now },
    expectedReturnDate: Date,
    notes: String,
  },
  { timestamps: true }
);

// ensure one active assignment per asset
assetAssignmentSchema.index({ assetId: 1 }, { unique: true });

const AssetAssignment = model("AssetAssignment", assetAssignmentSchema);
export default AssetAssignment;
