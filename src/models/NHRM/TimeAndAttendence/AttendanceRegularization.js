import mongoose from "mongoose";
const { Schema } = mongoose;

const regularizationSchema = new Schema(
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

    date: {
      type: Date,
      required: true,
      index: true
    },

    requestedIn: {
      type: Date
    },

    requestedOut: {
      type: Date
    },

    reason: {
      type: String,
      trim: true
    },

    /* 🔑 Policy enforcement helpers */
    isBackdated: {
      type: Boolean,
      default: false,
      index: true
    },

    backdatedDays: {
      type: Number,
      default: 0,
      min: 0
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

/* 🔒 Prevent multiple regularizations for same employee & date */
regularizationSchema.index(
  { organizationId: 1, employeeId: 1, date: 1 },
  { unique: true }
);

/* ⚡ Common approval queries */
regularizationSchema.index(
  { organizationId: 1, status: 1 }
);

export default mongoose.model(
  "AttendanceRegularization",
  regularizationSchema
);
