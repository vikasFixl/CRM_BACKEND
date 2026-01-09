import mongoose from "mongoose";
const { Schema } = mongoose;

const attendanceRegularizationSchema = new Schema(
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
     * Attendance date (UTC normalized, no time)
     */
    attendanceDate: {
      type: Date,
      required: true,
      index: true
    },

    /**
     * Requested correction
     */
    requestedIn: Date,
    requestedOut: Date,

    reason: {
      type: String,
      trim: true,
      required: true
    },

    /**
     * Policy helpers
     */
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

    approvedAt: Date,

    /**
     * Audit safety
     */
    remarks: String
  },
  { timestamps: true }
);

/* 🔒 One request per employee per day */
attendanceRegularizationSchema.index(
  { organizationId: 1, employeeId: 1, attendanceDate: 1 },
  { unique: true }
);

/* ⚡ HR approval queues */
attendanceRegularizationSchema.index(
  { organizationId: 1, status: 1 }
);

/* 🔐 Prevent changes after approval */
attendanceRegularizationSchema.pre("findOneAndUpdate", function (next) {
  this.where({ status: "Pending" });
  next();
});

export default mongoose.model(
  "AttendanceRegularization",
  attendanceRegularizationSchema
);
