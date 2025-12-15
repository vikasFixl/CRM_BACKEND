import mongoose from "mongoose";
const { Schema } = mongoose;

const monthlySummarySchema = new Schema(
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

    /**
     * Month identity (safe & queryable)
     */
    year: {
      type: Number,
      required: true,
      index: true
    },

    month: {
      type: Number, // 1–12
      required: true,
      min: 1,
      max: 12,
      index: true
    },

    /**
     * Attendance aggregates
     */
    presentDays: {
      type: Number,
      default: 0,
      min: 0
    },

    absentDays: {
      type: Number,
      default: 0,
      min: 0
    },

    leaveDays: {
      type: Number,
      default: 0,
      min: 0
    },

    paidLeaveDays: {
      type: Number,
      default: 0,
      min: 0
    },

    unpaidLeaveDays: {
      type: Number,
      default: 0,
      min: 0
    },

    holidays: {
      type: Number,
      default: 0,
      min: 0
    },

    weekendDays: {
      type: Number,
      default: 0,
      min: 0
    },

    /**
     * Time aggregates
     */
    overtimeMinutes: {
      type: Number,
      default: 0,
      min: 0
    },

    /**
     * Payroll-facing metrics
     */
    payableDays: {
      type: Number,
      default: 0,
      min: 0
    },

    /**
     * Payroll lock (CRITICAL)
     */
    lockedForPayroll: {
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

/* 🔒 One summary per employee per month */
monthlySummarySchema.index(
  { organizationId: 1, employeeId: 1, year: 1, month: 1 },
  { unique: true }
);

/* ⚡ Payroll batch queries */
monthlySummarySchema.index(
  { organizationId: 1, year: 1, month: 1 }
);

export default mongoose.model(
  "MonthlyAttendanceSummary",
  monthlySummarySchema
);
