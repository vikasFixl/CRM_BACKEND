import mongoose from "mongoose";
import { Schema } from "mongoose";

const payrollSlipSchema = new Schema(
  {
    payrollRunId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true
    },

    organizationId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true
    },

    employeeId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true
    },

    attendanceSummaryId: {
      type: Schema.Types.ObjectId,
      required: true
    },

    /* Attendance snapshot */
    totalWorkingDays: { type: Number, required: true },
    payableDays: { type: Number, required: true },
    unpaidLeaveDays: { type: Number, required: true },

    /* Salary snapshot */
    grossPay: { type: Number, required: true },
    deductions: { type: Number, required: true },
    unpaidLeaveDeduction: { type: Number, required: true },

    netPay: { type: Number, required: true },

    generatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

/* 🔒 One slip per employee per payroll */
payrollSlipSchema.index(
  { payrollRunId: 1, employeeId: 1 },
  { unique: true }
);

export const PayrollSlipModel =
  mongoose.model("PayrollSlip", payrollSlipSchema);
