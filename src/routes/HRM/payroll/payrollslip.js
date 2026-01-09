import mongoose from "mongoose";
import { Schema } from "mongoose";
const payrollSlipSchema = new Schema({
  payrollRunId: Schema.Types.ObjectId,
  employeeId: Schema.Types.ObjectId,

  attendanceSummaryId: Schema.Types.ObjectId,

  grossPay: Number,
  unpaidLeaveDays: Number,
  deductions: Number,
  netPay: Number,

  generatedAt: Date
}, { timestamps: true });

payrollSlipSchema.index(
  { payrollRunId: 1, employeeId: 1 },
  { unique: true }
);
export const PayrollSlipModel = mongoose.model("PayrollSlip", payrollSlipSchema);