import mongoose from "mongoose";
const { Schema } = mongoose;

const leaveRequestSchema = new Schema(
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

    leaveType: {
      type: String,
      required: true,
      trim: true
      // later you can enum this if you want
    },

    startDate: {
      type: Date,
      required: true,
      index: true
    },

    endDate: {
      type: Date,
      required: true,
      index: true
    },

    isHalfDay: {
      type: Boolean,
      default: false
    },

    halfDaySession: {
      type: String,
      enum: ["FIRST_HALF", "SECOND_HALF"],
      default: null
    },

    hours: {
      type: Number,
      min: 0
    },

    reason: {
      type: String,
      trim: true
    },

    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
      index: true
    },

    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "EmployeeProfile"
    },

    approvedAt: {
      type: Date
    }
  },
  { timestamps: true }
);

/* 🔒 Prevent duplicate overlapping leave requests (basic guard) */
leaveRequestSchema.index(
  { organizationId: 1, employeeId: 1, startDate: 1, endDate: 1 }
);

/* ⚡ HR approval screens */
leaveRequestSchema.index(
  { organizationId: 1, status: 1 }
);

export default mongoose.model("LeaveRequest", leaveRequestSchema);
