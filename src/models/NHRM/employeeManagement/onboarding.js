import mongoose from "mongoose";
const { Schema, model } = mongoose;

const verificationMeta = {
  verified: { type: Boolean, default: false },
  verifiedAt: Date,
  verifiedBy: { type: Schema.Types.ObjectId, ref: "User" },
  rejectionReason: String,
};

// Required onboarding documents
const requiredDocumentSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["AADHAR", "PAN", "BANK_CHEQUE"]
    },
    number: String,
    fileUrl: { type: String},
    public_id: String,
    ...verificationMeta,
  },
  { timestamps: true }
);

const onboardingSchema = new Schema(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },

    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "EmployeeProfile",
      required: true,
      unique: true,
      index: true,
    },

   status: {
  type: String,
  enum: [
    "Initiated",     // HR created onboarding entry
    "Pending",       // waiting for employee to submit docs
    "InProgress",    // HR verifying docs
    "Completed",     // done
    "Rejected",      // documents failed / not approved
    "Cancelled"      // onboarding withdrawn or stopped
  ],
  default: "Initiated",
  index: true,
},


    requiredDocuments: [requiredDocumentSchema],

    // ✅ Bank verification only (actual data lives in EmployeeProfile)
    bankDetailsVerified: {
      type: Boolean,
      default: false,
    },
    initiatedBy: { type: Schema.Types.ObjectId, ref: "User",required: true },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Indexes
onboardingSchema.index({ organizationId: 1, employeeId: 1 }, { unique: true });

export const Onboarding = model("Onboarding", onboardingSchema);
