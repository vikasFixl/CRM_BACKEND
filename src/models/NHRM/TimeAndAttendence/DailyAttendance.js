import mongoose from "mongoose";
const { Schema } = mongoose;

const dailyAttendanceSchema = new Schema(
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

    date: {
      type: Date,
      required: true,
      index: true
    },

    /**
     * Shift snapshot (DO NOT rely on ShiftMaster later)
     */
    shiftId: {
      type: Schema.Types.ObjectId,
      ref: "ShiftMaster"
    },

    shiftStartTime: String, // snapshot "09:00"
    shiftEndTime: String,   // snapshot "18:00"

    /**
     * Raw punch results
     */
    firstIn: Date,
    lastOut: Date,

    totalWorkMinutes: {
      type: Number,
      default: 0,
      min: 0
    },

    lateMinutes: {
      type: Number,
      default: 0,
      min: 0
    },

    earlyMinutes: {
      type: Number,
      default: 0,
      min: 0
    },

    overtimeMinutes: {
      type: Number,
      default: 0,
      min: 0
    },

    /**
     * Final attendance decision
     */
    status: {
      type: String,
      enum: [
        "Present",
        "Absent",
        "HalfDay",
        "Leave",
        "Holiday",
        "Weekend"
      ],
      required: true
    },

    /**
     * Who decided this record
     */
    source: {
      type: String,
      enum: ["system", "regularized", "manual"],
      default: "system",
      index: true
    },

    /**
     * Lock prevents recalculation
     */
    isLocked: {
      type: Boolean,
      default: false,
      index: true
    },

    lockedAt: Date,
    lockedBy: {
      type: Schema.Types.ObjectId,
      ref: "EmployeeProfile"
    }
  },
  { timestamps: true }
);

/* 🔒 One record per employee per day */
dailyAttendanceSchema.index(
  { organizationId: 1, employeeId: 1, date: 1 },
  { unique: true }
);

/* ⚡ HR dashboards */
dailyAttendanceSchema.index(
  { organizationId: 1, date: 1 }
);

export default mongoose.model(
  "DailyAttendance",
  dailyAttendanceSchema
);
 