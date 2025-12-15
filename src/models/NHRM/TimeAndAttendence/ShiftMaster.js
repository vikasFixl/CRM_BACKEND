import mongoose from "mongoose";
const { Schema } = mongoose;

const shiftSchema = new Schema(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true
    },

    shiftType: {
      type: String,
      enum: ["morning", "noon", "night"],
      required: true
    },

    startTime: {
      type: String, // "HH:mm"
      required: true,
      match: /^([01]\d|2[0-3]):([0-5]\d)$/
    },

    endTime: {
      type: String, // "HH:mm"
      required: true,
      match: /^([01]\d|2[0-3]):([0-5]\d)$/
    },

    breakMinutes: {
      type: Number,
      default: 0,
      min: 0
    },

    graceInMinutes: {
      type: Number,
      default: 0,
      min: 0
    },

    graceOutMinutes: {
      type: Number,
      default: 0,
      min: 0
    },

    halfDayAfterMinutes: {
      type: Number,
      required: true,
      min: 0
    },

    overtimeAfterMinutes: {
      type: Number,
      default: 0,
      min: 0
    },

    isNightShift: {
      type: Boolean,
      default: false
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  { timestamps: true }
);

/* 🔒 One shift type per organization */
shiftSchema.index(
  { organizationId: 1, shiftType: 1 },
  { unique: true }
);

/* ⚡ Fast lookup for active shifts */
shiftSchema.index(
  { organizationId: 1, isActive: 1 }
);

export default mongoose.model("ShiftMaster", shiftSchema);
