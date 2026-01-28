import mongoose from "mongoose";
const { Schema } = mongoose;

const rawTimeLogSchema = new Schema(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true
    },

    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "EmployeeProfile",
      required: true,
      index: true
    },

    locationId: {
      type: Schema.Types.ObjectId,
      ref: "Location",
      index: true
    },

    /** Actual event time from device */
    timestamp: {
      type: Date,
      required: true,
      index: true
    },

    /**
     * Shift-resolved logical day
     * (used for attendance grouping, NOT truth)
     */
    logicalDay: {
      type: Date,
      required: true,
      index: true
    },

    punchType: {
      type: String,
      enum: ["IN", "OUT"],
      required: true
    },

    source: {
      type: String,
      enum: ["mobile", "web", "biometric", "admin"],
      required: true
    },

    deviceId: {
      type: String,
      trim: true
    },

    ipAddress: {
      type: String,
      trim: true
    },

    /** Deduplication key (CRITICAL) */
    dedupKey: {
      type: String,
      required: true,
      unique: true
    },

    /** System ingestion time */
    ingestedAt: {
      type: Date,
      default: Date.now,
      index: true
    },

    /** Manual punch info */
    isManual: {
      type: Boolean,
      default: false,
      index: true
    },

    manualMeta: {
      reason: String,
      approvedBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
      },
      approvedAt: Date,
      sourceRequestId: {
        type: Schema.Types.ObjectId,
        ref: "AttendanceRegularization"
      }
    }
  },
  {
    timestamps: false,
    versionKey: false
  }
);

/* Core timeline index */
rawTimeLogSchema.index({
  organizationId: 1,
  employeeId: 1,
  timestamp: 1
});

/* Logical day grouping */
rawTimeLogSchema.index({
  organizationId: 1,
  employeeId: 1,
  logicalDay: 1
});

/* IMMUTABILITY GUARDS */
rawTimeLogSchema.pre("updateOne", () => {
  throw new Error("RawTimeLog is immutable");
});
rawTimeLogSchema.pre("findOneAndUpdate", () => {
  throw new Error("RawTimeLog is immutable");
});
rawTimeLogSchema.pre("deleteOne", () => {
  throw new Error("RawTimeLog cannot be deleted");
});
rawTimeLogSchema.pre("findOneAndDelete", () => {
  throw new Error("RawTimeLog cannot be deleted");
});

export default mongoose.model("RawTimeLog", rawTimeLogSchema);
