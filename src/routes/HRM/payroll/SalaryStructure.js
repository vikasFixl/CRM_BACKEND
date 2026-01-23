import mongoose from 'mongoose';
const { Schema } = mongoose; const salaryStructureSchema = new Schema(
  {
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

    basic: { type: Number, required: true, min: 0 },
    hra: { type: Number, default: 0, min: 0 },
    allowances: { type: Number, default: 0, min: 0 },

    deductions: { type: Number, default: 0, min: 0 },

    gross: { type: Number, required: true },
    net: { type: Number, required: true },

    effectiveFrom: {
      type: Date,
      required: true,
      index: true
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  { timestamps: true }
);

/* 🔒 Only ONE active salary per employee */
salaryStructureSchema.index(
  { organizationId: 1, employeeId: 1 },
  {
    unique: true,
    partialFilterExpression: { isActive: true }
  }
);

/* 🔐 Auto-calc safety */
salaryStructureSchema.pre("validate", function (next) {
  this.gross = this.basic + this.hra + this.allowances;
  this.net = this.gross - this.deductions;
  next();
});

export const SalaryStructureModel =
  mongoose.model("SalaryStructure", salaryStructureSchema);
