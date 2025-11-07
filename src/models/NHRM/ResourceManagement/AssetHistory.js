import mongoose from "mongoose";
const { Schema, model } = mongoose;

const assetAssignmentHistorySchema = new Schema(
  {
    assetId: { type: Schema.Types.ObjectId, ref: "Asset", required: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: "EmployeeProfile" },
    assignmentDate: Date,
    returnDate: Date,
    conditionOnReturn: {
      type: String,
      enum: ["Good", "Needs Repair", "Damaged", "Lost"],
      default: "Good",
    },
    notes: String,
  },
  { timestamps: true }
);

const AssetAssignmentHistory = model(
  "AssetAssignmentHistory",
  assetAssignmentHistorySchema
);
export default AssetAssignmentHistory;
