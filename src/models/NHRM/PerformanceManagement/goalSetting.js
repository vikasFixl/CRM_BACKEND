import mongoose from 'mongoose';
const { Schema } = mongoose;

const goalSettingSchema = new Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true
    },

    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EmployeeProfile",
      required: true,
      index: true,
    },

    goal: {
      type: String,
      required: true,
      trim: true
    },

    keyPerformanceIndicators: {
      type: [String],
      default: [],
    },

    targetDate: {
      type: Date,
      required: true,
      index: true
    },

    status: {
      type: String,
      enum: ["In Progress", "Completed", "Delayed"],
      default: "In Progress",
      index: true,
    },

    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    createdBy:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }
  },
  { timestamps: true }
);

// Important indexes
goalSettingSchema.index({ organization: 1, employee: 1 });
goalSettingSchema.index({ status: 1 });
goalSettingSchema.index({ targetDate: 1 });

const GoalSetting = mongoose.model("GoalSetting", goalSettingSchema);

export default GoalSetting;
