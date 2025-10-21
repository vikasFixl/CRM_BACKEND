import mongoose from "mongoose";
const { Schema, model } = mongoose;
// Individual Step Schema
const onboardingStepSchema = new Schema(
  {
    key: { type: String, required: true }, // e.g. "personalInfo", "documents"
    label: String,
    status: {
      type: String,
      enum: ["Pending", "Completed", "Verified"],
      default: "Pending",
    },
    completedAt: Date,
    verifiedAt: Date,
    verifiedBy: { type: Schema.Types.ObjectId, ref: "User" },
    note: String,
    documents: [{ type: Schema.Types.ObjectId, ref: "Document" }],
  },
  { _id: false }
);

// Main Onboarding Schema
const onboardingSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    employeeId: { type: Schema.Types.ObjectId, ref: "EmployeeProfile", required: true, unique: true },

    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed", "Rejected"],
      default: "Pending",
      index: true,
    },

    steps: [onboardingStepSchema],

    documents: [
      {
        name: String,
        fileUrl: String,
        version: { type: Number, default: 1 },
        uploadedAt: { type: Date, default: Date.now },
        verified: { type: Boolean, default: false },
        verifiedBy: { type: Schema.Types.ObjectId, ref: "User" },
        rejectedReason: String,
      },
    ],

    checklistProgress: {
      total: { type: Number, default: 0 },
      completed: { type: Number, default: 0 },
      percentage: { type: Number, default: 0, min: 0, max: 100 },
    },

    notes: String,

    // Workflow Assignments
    assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
    initiatedBy: { type: Schema.Types.ObjectId, ref: "User" },

    // Soft Delete
    isDeleted: { type: Boolean, default: false },
    deletedAt: Date,
    deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Indexes
onboardingSchema.index({ organizationId: 1, status: 1 });
onboardingSchema.index({ organizationId: 1, employeeId: 1 }, { unique: true });

export const Onboarding = model("Onboarding", onboardingSchema);
