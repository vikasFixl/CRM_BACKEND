const payrollRunSchema = new Schema(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true
    },

    year: { type: Number, required: true },
    month: { type: Number, required: true, min: 1, max: 12 },

    status: {
      type: String,
      enum: ["Draft", "Locked", "Paid"],
      default: "Draft",
      index: true
    },

    processedAt: Date,

    lockedAt: Date,
    lockedBy: {
      type: Schema.Types.ObjectId,
      ref: "EmployeeProfile"
    }
  },
  { timestamps: true }
);

/* 🔒 One payroll per month */
payrollRunSchema.index(
  { organizationId: 1, year: 1, month: 1 },
  { unique: true }
);

export const PayrollRunModel =
  mongoose.model("PayrollRun", payrollRunSchema);
