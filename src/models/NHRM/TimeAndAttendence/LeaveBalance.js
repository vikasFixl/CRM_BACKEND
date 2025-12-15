import mongoose from "mongoose";
const { Schema } = mongoose;

const leaveBalanceSchema = new Schema(
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
     * Reference to LeaveType master
     * (Annual, Sick, LWP, etc.)
     */
    leaveTypeId: {
      type: Schema.Types.ObjectId,
      ref: "LeaveType",
      required: true,
      index: true
    },

    /**
     * Snapshot for payroll safety
     * (in case LeaveType is edited later)
     */
    isPaid: {
      type: Boolean,
      required: true
    },

    year: {
      type: Number,
      required: true,
      index: true
    },

    totalAllocated: {
      type: Number,
      required: true,
      min: 0
    },

    used: {
      type: Number,
      default: 0,
      min: 0
    },

    remaining: {
      type: Number,
      required: true,
      min: 0
    },

    /**
     * System control flags
     */
    isActive: {
      type: Boolean,
      default: true
    },

    lastAdjustedBy: {
      type: Schema.Types.ObjectId,
      ref: "EmployeeProfile"
    },

    adjustmentReason: {
      type: String,
      trim: true
    }
  },
  { timestamps: true }
);

/* 🔒 One balance per employee per leave type per year */
leaveBalanceSchema.index(
  { organizationId: 1, employeeId: 1, leaveTypeId: 1, year: 1 },
  { unique: true }
);

/* ⚡ Fast balance lookup */
leaveBalanceSchema.index(
  { organizationId: 1, employeeId: 1, year: 1 }
);

/**
 * 🔐 Safety hook
 * Paid leave only. Remaining is derived.
 */
leaveBalanceSchema.pre("save", function (next) {
  if (this.isPaid) {
    this.remaining = Math.max(this.totalAllocated - this.used, 0);
  } else {
    // Unpaid leave should never rely on balance
    this.remaining = 0;
    this.totalAllocated = 0;
    this.used = 0;
  }
  next();
});

export default mongoose.model("LeaveBalance", leaveBalanceSchema);
