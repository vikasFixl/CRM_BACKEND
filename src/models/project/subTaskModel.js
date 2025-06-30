import mongoose from "mongoose";

const SubtaskSchema = new mongoose.Schema(
  {
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
      index: true,
    },
    summary: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    status: {
      type: String,
      required: true,
      enum: ["todo", "in_progress", "done"], // Optional: Normalize status
      lowercase: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    assigneeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    dueDate: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    labels: [
      {
        type: String,
        trim: true,
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
SubtaskSchema.index({ parentId: 1 });
SubtaskSchema.index({ assigneeId: 1 });
SubtaskSchema.index({ isDeleted: 1 });

export const Subtask = mongoose.model("Subtask", SubtaskSchema);
