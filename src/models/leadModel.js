import mongoose from "mongoose";
import crypto from "crypto";


// Enums
const STAGE_ENUM = [
  "New",           // Just entered the system
  "Contacted",     // Initial contact made
  "Qualified",     // Verified as a good fit
  "Proposal",      // Proposal sent
  "Negotiation",   // Discussing terms
  "Closed-Won",    // Successfully converted
  "Closed-Lost"    // Not converted
];

const PRIORITY_ENUM = ["Low", "Medium", "High", "Critical"];
const SOURCE_ENUM = [
  "Website",
  "Referral",
  "Social Media",
  "Advertisement",
  "Event",
  "Cold Call",
  "Other"
];

// Sub-schemas
const interactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["call", "email", "meeting", "note"],
      required: true
    },
    summary: String,
    details: String,
    date: { type: Date, default: Date.now },
    participants: [{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      role: String
    }]
  },
  { _id: false }
);

const stageHistorySchema = new mongoose.Schema(
  {
    stage: { type: String, required: true, enum: STAGE_ENUM },
    enteredAt: { type: Date, default: Date.now },
    exitedAt: Date,
    reason: String  // Why stage changed (especially useful for Closed-Lost)
  },
  { _id: false }
);

const leadSchema = new mongoose.Schema(
  {
    // Basic Info
    title: { type: String, required: true },
    description: String,
    leadId: { type: String, unique: true },

    // Client Info
    contact: {
      name: { type: String, required: true },
      email: {
        type: String,
        lowercase: true,
        match: [/\S+@\S+\.\S+/, 'is invalid']
      },
      phone: {
        type: String,
      },
      company: String,
      position: String
    },

    // Lead Source & Details
    source: {
      type: String,
      enum: SOURCE_ENUM,
      required: true
    },
    sourceDetails: String, // e.g., which event, which referral, etc.

    // Sales Process
    stage: {
      type: String,
      required: true,
      enum: STAGE_ENUM,
      default: "New"
    },
    stageHistory: [stageHistorySchema],
    probability: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },

    // Financial Info
    estimatedValue: { type: Number },
    currency: { type: String, default: "INR" },

    // Assignment
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    // team: { 
    //   type: mongoose.Schema.Types.ObjectId, 
    //   ref: "Team" 
    // },

    // Organization
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true
    },
    firm: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Firm",
      required: true
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // The person currently handling the lead
    },
    assignedAt: {
      type: Date
    },

    // Tracking
    nextAction: {
      type: String,
      enum: [
        "Call",
        "Email",
        "Meeting",
        "Send Proposal",
        "Follow Up",
        "Close"
      ]
    },
    nextActionDate: Date,
    priority: {
      type: String,
      enum: PRIORITY_ENUM,
      default: "Medium"
    },

    // Interactions
    interactions: [interactionSchema],
    notes: [String],

    // Metadata
    tags: [String],
    customFields: mongoose.Schema.Types.Mixed,

    // System
    isActive: { type: Boolean, default: true },
    deletedAt: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes
leadSchema.index({ title: "text", "contact.name": "text", "contact.company": "text" });
leadSchema.index({ organization: 1, stage: 1 });
leadSchema.index({ owner: 1, nextActionDate: 1 });

// Helper Methods
leadSchema.methods.calculateProbability = function () {
  // Simple probability based on stage
  const stageProbabilities = {
    "New": 10,
    "Contacted": 20,
    "Qualified": 40,
    "Proposal": 60,
    "Negotiation": 80,
    "Closed-Won": 100,
    "Closed-Lost": 0
  };
  return stageProbabilities[this.stage] || 0;
};

// Pre-save hooks
leadSchema.pre("save", function (next) {
  if (!this.leadId) {
    this.leadId = `LD-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
  }

  // Update probability if stage changed
  if (this.isModified('stage')) {
    this.probability = this.calculateProbability();
  }

  next();
});

export const Lead = mongoose.model("Lead", leadSchema);