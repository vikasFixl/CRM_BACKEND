import mongoose from "mongoose";
import { Schema } from "mongoose";
const payrollRunSchema = new Schema({
  organizationId: Schema.Types.ObjectId,
  year: Number,
  month: Number,

  status: {
    type: String,
    enum: ["Draft", "Locked", "Paid"],
    default: "Draft"
  },

  processedAt: Date
}, { timestamps: true });

payrollRunSchema.index(
  { organizationId: 1, year: 1, month: 1 },
  { unique: true }
);
export const PayrollRunModel = mongoose.model("PayrollRun", payrollRunSchema);