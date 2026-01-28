import mongoose from "mongoose";
const { Schema } = mongoose;

const holidaySchema = new Schema(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true
    },
isMandatory: {
  type: Boolean,
  default: true
},

    date: {
      type: Date,
      required: true,
      index: true
    },

    name: {
      type: String,
      required: true,
      trim: true
    },

    /**
     * Holiday classification
     */
    type: {
      type: String,
      enum: ["National", "Optional"],
      required: true
    },

    /**
     * Location-specific holiday
     * null = applies to all locations
     */
    locationId: {
      type: Schema.Types.ObjectId,
      default: null,
      index: true
    },

    /**
     * Payroll relevance
     */
    isPaid: {
      type: Boolean,
      default: true
    },

    /**
     * Soft control
     */
    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  { timestamps: true }
);

/* 🔒 Prevent duplicate holidays */
holidaySchema.index(
  { organizationId: 1, date: 1, locationId: 1 },
  { unique: true }
);

/* ⚡ Attendance queries */
holidaySchema.index({ organizationId: 1, date: 1 });

export default mongoose.model("HolidayCalendar", holidaySchema);
