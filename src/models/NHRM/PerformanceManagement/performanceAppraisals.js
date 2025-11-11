import mongoose from 'mongoose';
const { Schema } = mongoose;

const performanceAppraisalSchema = new Schema(
  {
    organization: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "EmployeeProfile", required: true, index: true },

    period: { type: String, required: true }, // 2025-Q1, 2024-Annual

    rating: { type: Number, min: 1, max: 5, required: true },

    criteria: [
      {
        label: String,
        score: { type: Number, min: 1, max: 5 },
        comments: String
      }
    ],

    comments: { type: String, trim: true, maxLength: 1000 },

    managerComments: { type: String, trim: true, maxLength: 1000 },

    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    recommendation: {
      type: String,
      enum: ["None", "Promotion", "Salary Hike", "Warning", "Training"],
      default: "None"
    },

    status: {
      type: String,
      enum: ["Pending", "Completed"],
      default: "Pending",
      index: true
    },

    appraisalDate: { type: Date, required: true, default: Date.now }
  },
  { timestamps: true }
);

export const PerformanceAppraisal = mongoose.model("PerformanceAppraisal", performanceAppraisalSchema);
export default PerformanceAppraisal;