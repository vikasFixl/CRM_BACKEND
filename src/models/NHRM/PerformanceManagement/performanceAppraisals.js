import mongoose from 'mongoose';
const { Schema } = mongoose;

const performanceAppraisalSchema = new Schema(
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
      index: true
    },

    appraisalDate: {
      type: Date,
      required: true,
      default: Date.now
    },

    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },

    comments: {
      type: String,
      trim: true,
      maxLength: 1000
    },

    managerComments: {
      type: String,
      trim: true,
      maxLength: 1000
    },

    status: {
      type: String,
      enum: ["Pending", "Completed"],
      default: "Pending",
      index: true
    }
  },
  { timestamps: true } // Auto-manages createdAt & updatedAt
);

// Optimized indexes
performanceAppraisalSchema.index({ organization: 1, employee: 1 });
performanceAppraisalSchema.index({ appraisalDate: 1 });
performanceAppraisalSchema.index({ status: 1 });

const PerformanceAppraisal = mongoose.model("PerformanceAppraisal", performanceAppraisalSchema);

export default PerformanceAppraisal;
