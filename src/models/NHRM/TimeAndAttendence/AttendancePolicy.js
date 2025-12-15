import mongoose from "mongoose";
const { Schema } = mongoose;

const policySchema = new Schema(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true
    },

    lateAllowedMinutes: {
      type: Number,
      default: 0,
      min: 0
    },

    halfDayThresholdMinutes: {
      type: Number,
      required: true,
      min: 0
    },

    absentThresholdMinutes: {
      type: Number,
      required: true,
      min: 0
    },

    overtimeMinMinutes: {
      type: Number,
      default: 0,
      min: 0
    },

    allowEarlyPunch: {
      type: Boolean,
      default: true
    },

    allowLatePunch: {
      type: Boolean,
      default: true
    },

    sandwichLeaveRule: {
      type: Boolean,
      default: false
    },

    /* Real-world controls */
    allowBackdatedRegularization: {
      type: Boolean,
      default: true
    },

    maxBackdateDays: {
      type: Number,
      default: 30,
      min: 0
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true
    },

    effectiveFrom: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

/* 🔒 Enforce ONE ACTIVE policy per organization */
policySchema.index(
  { organizationId: 1 },
  {
    unique: true,
    partialFilterExpression: { isActive: true }
  }
);

/* ⚡ Fast lookup for current policy */
policySchema.index(
  { organizationId: 1, isActive: 1 }
);

export default mongoose.model("AttendancePolicy", policySchema);
