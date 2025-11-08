import mongoose from 'mongoose';
const { Schema } = mongoose;

const improvementPlanSchema = new Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true
    },

    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EmployeeProfile", // HR or Manager targets employee
      required: true,
      index: true
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // HR / Manager
      required: true,
      index: true
    },

    planDate: {
      type: Date,
      required: true,
      default: Date.now
    },

    objectives: {
      type: [String],
      default: [],
      required: true
    },

    actions: {
      type: [String],
      default: [],
      required: true
    },

    timeline: {
      type: Date,
      required: true
    },

    status: {
      type: String,
      enum: ["In Progress", "Completed", "Delayed"],
      default: "In Progress",
      index: true
    },

    managerComments: {
      type: String,
      trim: true,
      maxLength: 1000
    }
  },
  {
    timestamps: true // Auto createdAt + updatedAt
  }
);

// Optimized indexes
improvementPlanSchema.index({ organization: 1, employee: 1 });
improvementPlanSchema.index({ status: 1 });
improvementPlanSchema.index({ planDate: 1 });

const ImprovementPlan = mongoose.model("ImprovementPlan", improvementPlanSchema);

export default ImprovementPlan;
