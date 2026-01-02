import mongoose from "mongoose";
const { Schema } = mongoose;

const leaveTypeSchema = new Schema(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true
    },

    /**
     * Display name
     * e.g. "Annual Leave", "Sick Leave"
     */
    name: {
      type: String,
      required: true,
      trim: true
    },

    /**
     * Internal code (stable, unique)
     * e.g. "AL", "SL", "LWP"
     */
    code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true
    },

    /**
     * Paid vs unpaid (CRITICAL for payroll)
     */
    isPaid: {
      type: Boolean,
      required: true
    },

    /**
     * Annual allocation (ONLY for paid leave)
     * Null for unpaid leave
     */
    annualAllocation: {
      type: Number,
      min: 0,
      default: null
    },

    /**
     * Can employee apply half-day?
     */
    allowHalfDay: {
      type: Boolean,
      default: false
    },

    /**
     * Is this leave enabled?
     */
    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
,
  accrualType: {
  type: String,
  enum: ["MONTHLY", "YEARLY"],
  default: "YEARLY"
},

monthlyAccrual: {
  type: Number, // e.g. 1 per month
  default: 0
},

maxCarryForward: {
  type: Number, // e.g. 10
  default: 0
},

allowEncashment: {
  type: Boolean,
  default: false
},

maxEncashable: {
  type: Number, // e.g. 10
  default: 0
}
  },
  { timestamps: true }
);

/* 🔒 One leave code per organization */
leaveTypeSchema.index(
  { organizationId: 1, code: 1 },
  { unique: true }
);

/* ⚡ Fast lookup */
leaveTypeSchema.index(
  { organizationId: 1, isActive: 1 }
);

/**
 * 🔐 Safety validation
 */
leaveTypeSchema.pre("save", function (next) {
  if (this.isPaid && this.annualAllocation == null) {
    return next(new Error("Paid leave must have annualAllocation"));
  }

  if (!this.isPaid && this.annualAllocation != null) {
    this.annualAllocation = null; // enforce rule
  }

  next();
});

export default mongoose.model("LeaveType", leaveTypeSchema);
