import mongoose from "mongoose";
const { Schema } = mongoose;

const monthlyAttendanceSummarySchema = new Schema(
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

    /* 🔢 Calendar metrics */
    totalCalendarDays: {
      type: Number,
      required: true,
      min: 28,
      max: 31
    },

    totalWorkingDays: {
      type: Number,
      required: true,
      min: 0
    },

    /* 🟢 Attendance breakup */
    presentDays: { type: Number, default: 0 },
    absentDays: { type: Number, default: 0 },

    leaveDays: { type: Number, default: 0 },
    paidLeaveDays: { type: Number, default: 0 },
    unpaidLeaveDays: { type: Number, default: 0 },

    holidays: { type: Number, default: 0 },
    weekendDays: { type: Number, default: 0 },

    /* ⏱ Time-based */
    overtimeMinutes: { type: Number, default: 0 },

    /* 💰 Payroll-facing */
    payableDays: {
      type: Number,
      required: true,
      min: 0
    },

    /* 🔒 Payroll lock */
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
monthlyAttendanceSummarySchema.index(
  { organizationId: 1, employeeId: 1, year: 1, month: 1 },
  { unique: true }
);

/* ⚡ Payroll batch */
monthlyAttendanceSummarySchema.index(
  { organizationId: 1, year: 1, month: 1 }
);

export default mongoose.model(
  "MonthlyAttendanceSummary",
  monthlyAttendanceSummarySchema
);
