import mongoose from "mongoose";
const { Schema } = mongoose;

const assignmentSchema = new Schema(
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

    shiftId: {
      type: Schema.Types.ObjectId,
      ref: "ShiftMaster",
      required: true
    },

    effectiveFrom: {
      type: Date,
      required: true
    },

    effectiveTo: {
      type: Date,
      default: null // null = currently active
    },

    /**
     * Logical enable / disable
     * (DO NOT delete assignments)
     */
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },

    locationId: {
      type: Schema.Types.ObjectId,
      index: true
    }
  },
  { timestamps: true }
);

/* 🔒 Ensure only ONE active shift per employee */
assignmentSchema.index(
  { organizationId: 1, employeeId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      isActive: true,
      effectiveTo: null
    }
  }
);

/* ⚡ Attendance lookup index (date-based) */
assignmentSchema.index({
  organizationId: 1,
  employeeId: 1,
  effectiveFrom: 1,
  effectiveTo: 1
});

export default mongoose.model(
  "EmployeeShiftAssignment",
  assignmentSchema
);
