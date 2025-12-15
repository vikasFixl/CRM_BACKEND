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

    timestamp: {
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

    /**
     * Manual/admin punch indicator
     * (used for audits & policy checks)
     */
    isManual: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: false,
    versionKey: false
  }
);

/* 🔑 Core index: timeline per employee */
rawTimeLogSchema.index(
  { organizationId: 1, employeeId: 1, timestamp: 1 }
);

/* 🔑 Day-based attendance queries */
rawTimeLogSchema.index(
  { organizationId: 1, employeeId: 1, punchType: 1, timestamp: 1 }
);

/* 🔒 IMMUTABILITY GUARD */
rawTimeLogSchema.pre("updateOne", function () {
  throw new Error("RawTimeLog is immutable");
});
rawTimeLogSchema.pre("findOneAndUpdate", function () {
  throw new Error("RawTimeLog is immutable");
});
rawTimeLogSchema.pre("deleteOne", function () {
  throw new Error("RawTimeLog cannot be deleted");
});
rawTimeLogSchema.pre("findOneAndDelete", function () {
  throw new Error("RawTimeLog cannot be deleted");
});

export default mongoose.model("RawTimeLog", rawTimeLogSchema);
