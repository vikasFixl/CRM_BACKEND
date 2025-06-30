import mongoose from "mongoose";
import crypto from "crypto";
const STAGE_ENUM = [
  "New",
  "Contacted",
  "Qualified",
  "Demo",
  "ProposalSent",
  "Negotiation",
  "Won",
  "Lost",
  "Converted",
];
// Sub-schemas
const interactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["call", "email", "meeting", "note", "other"],
      required: true,
    },
    description: String,
    date: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { _id: false }
);

const stageHistorySchema = new mongoose.Schema(
  {
    stageName: { type: String, required: true, enum: STAGE_ENUM },
    startedAt: { type: Date, default: Date.now },
    endedAt: Date,
  },
  { _id: false }
);

const leadSchema = new mongoose.Schema(
  {
    // Basic Info
    title: { type: String, required: true, unique: true },
    description: String,

    // Client Info
    client: {
      firstName: String,
      lastName: String,
      email: {
        type: String,
        unique: true,
      },
      phone: {
        type: String,
        unique: true,
      },
      address: {
        line1: String,

        city: String,
        state: String,
        country: String,
        postalCode: String,
      },
    },

    // Financial Info
    estimatedWorth: { type: Number },
    currency: { type: String, default: "INR" },

    // Stage & Status
    stage: { type: String, required: true, enum: STAGE_ENUM },
    stageHistory: [stageHistorySchema],
    status: {
      type: String,
      enum: ["New", "Won", "Lost", "Hold"],
      default: "New",
      index: true,
    },

    // Assignment
    leadManagerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    assignedToId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // Pipeline Info
    pipeline: {
      department: String,
      userType: String,
    },
    tags: [String],

    // Org/Firm
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    firmId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Firm",
    },

    // Tracking
    timezone: String,

    // Interactions/Notes
    interactions: [interactionSchema],
    notes: String,

    closureDate: { type: Date },
    followUpDate: { type: Date },
    // Lead Intelligence
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
    },
    leadScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    nextAction: {
      type: String,
      enum: [
        "Call Lead",
        "Send Email",
        "Schedule Meeting",
        "Demo",
        "Send Proposal",
        "Negotiate",
        "Close Deal",
        "Follow Up Later",
        "Collect Documents",
        "Other",
      ],
      default: "Follow Up Later",
    },
    customNextAction: {
      type: String,
      default: "",
      trim: true,
    },

    // Soft Delete
    deleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: { type: Date },
    // Auto ID
    LeadId: { type: String, unique: true },
  },
  { timestamps: true }
);

// Auto-index for common queries
leadSchema.index({ "client.email": 1, orgId: 1 }, { unique: false });

/**
 * Auto Score Logic (can be in controller or pre('save'))
 */
function calculateLeadScore(lead) {
  let score = 0;
  if (lead.estimatedWorth > 100000) score += 20;
  if (lead.status === "Contacted") score += 10;
  if (lead.source === "Referral") score += 15;
  if (["High", "Critical"].includes(lead.priority)) score += 10;
  if (lead.followUpDate) {
    const diff =
      (new Date(lead.followUpDate) - new Date()) / (1000 * 60 * 60 * 24);
    if (diff <= 3 && diff >= 0) score += 10;
  }
  return Math.min(score, 100);
}
export function generateUniqueLeadId() {
  const randomBytes = crypto.randomBytes(4); // 4 bytes = 32 bits
  const randomPart = parseInt(randomBytes.toString("hex"), 16)
    .toString(36)
    .substring(0, 6)
    .toUpperCase();
  return `LEAD-${randomPart}`;
}

// Auto leadScore hook
leadSchema.pre("save", async function (next) {
  this.LeadId = generateUniqueLeadId();

  // Lead score calculation if needed
  this.leadScore = calculateLeadScore(this);
  next();
});

export const Lead = mongoose.model("Lead", leadSchema);
