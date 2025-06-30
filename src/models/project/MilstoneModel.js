import mongoose from "mongoose";

const MilestoneSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    dueDate: {
      type: Date,
      required: false,
    },
    startDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["not started", "in progress", "completed"],
      default: "not started",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isDeleted: {
      type: Boolean,
      default: false,
      select: false,
    },
  },
  { timestamps: true }
);

// Indexes
MilestoneSchema.index({ projectId: 1, name: 1 }, { unique: true });
MilestoneSchema.index({ isDeleted: 1 });

export const Milestone = mongoose.model("Milestone", MilestoneSchema);
