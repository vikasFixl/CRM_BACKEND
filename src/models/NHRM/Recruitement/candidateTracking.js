
import mongoose from "mongoose";
const { Schema } = mongoose;

const feedbackSchema = new Schema(
  {
    givenBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    comment: { type: String, trim: true },
    rating: { type: Number, min: 1, max: 5 },
    stage: {
      type: String,
      enum: ["Screening", "Interview", "Offer", "Final"],
    },
  },
  { timestamps: true }
);

const candidateSchema = new Schema(
  {
    // 🧍 Basic Info
    organization: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    firstName: { type: String, required: true, trim: true, index: true },
    lastName: { type: String, required: true, trim: true, index: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    phoneNumber: {
      type: String,
      unique: true,
      sparse: true, // allows nulls without violating unique
      trim: true,
      index: true,
    },
    location: { type: String, trim: true, required: true },
    linkedInProfile: { type: String, trim: true, required: true },
    portfolio: { type: String, trim: true },
    resume: { type: String, trim: true, required: true }, // URL
    coverLetter: { type: String, trim: true }, // URL

    // 🧩 Application Details
    jobApplication: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobPosting",
      required: true,
      index: true,
    },
    source: {
      type: String,
      enum: ["LinkedIn", "Indeed", "Referral", "Walk-in", "Other"],
      default: "Other",
    },
    referral: { type: mongoose.Schema.Types.ObjectId, ref: "EmployeeProfile" },

    // 🧠 Evaluation Data
    skills: [{ type: String, trim: true, required: true }],
    experience: { type: Number, min: 0, required: true }, // in years
    education: { type: String, trim: true, required: true },
    expectedSalary: { type: Number, min: 0, required: true },
    currentSalary: { type: Number, min: 0, required: true },
    noticePeriod: { type: String, trim: true, required: true }, // e.g. "30 days", "Immediate"
    feedback: [feedbackSchema],

    // 🗓️ Recruitment Progress
    status: {
      type: String,
      enum: [
        "Applied",
        "Screening",
        "Shortlisted",
        "Interview_Scheduled",
        "Interview_Completed",
        "Offered",
        "Rejected",
        "Hired",
      ],
      default: "Applied",
      index: true,
    },
    stageHistory: [
      {
        stage: String,
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
    interviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Interview" }],
    offer: { type: mongoose.Schema.Types.ObjectId, ref: "Offer" },
    employeeProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EmployeeProfile",
    },

    // 🧾 System & Audit Fields
    appliedDate: { type: Date, default: Date.now },
    lastUpdated: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    isArchived: { type: Boolean, default: false },
    notes: [{ type: String, trim: true }],

    // ⚙️ Metadata for Tracking
    tags: [{ type: String, trim: true }], // e.g. ["frontend", "urgent", "high-priority"]
    rating: { type: Number, min: 1, max: 5 }, // overall rating for quick filtering
    resumeScore: { type: Number, min: 0, max: 100 }, // AI or HR-driven score
  },
  { timestamps: true }
);

candidateSchema.index({ firstName: 1, lastName: 1, status: 1 });
candidateSchema.index({ email: 1 });
candidateSchema.index({ jobApplication: 1, status: 1 });
candidateSchema.index({ createdBy: 1 });

export const Candidate = mongoose.model("Candidate", candidateSchema);
