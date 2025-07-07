import mongoose from "mongoose";
import { generateTaskCode } from "../../utils/helperfuntions/generateInviteCode.js";


const TaskSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    taskCode: {
      type: String,
      required: true,
         default: generateTaskCode,
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
      maxlength: 5000,
    },
    type: {
      type: String,
      enum: ["task", "bug", "story", "epic", "spike"], // ❌ subtask removed
      required: true,
    },
    columnOrder: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
    },

    // Assignment
    assigneeId: {
      // The person responsible for completing the task.
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProjectMember",
    },
    createdBy: {
      //The person who created or reported the task/issue.
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    assignedTeamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
    },

    // Planning
    sprintId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sprint",
    },
    epicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Epic", // <-- FIXED
    },

    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task", // Self-reference for subtasks
    },

    // Dates
    startDate: {
      type: Date,
      default: Date.now(),
    },
    dueDate: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },

    // Estimation // complexity of task
    storyPoints: {
      type: Number,
      enum: [1, 2, 3, 5, 8, 13, 21],
      default: 1,
    },
    boardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Board",
    },

    // Metadata
    labels: [{ type: String, trim: true }],
    watchers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    attachments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Attachment" }],
    customFields: mongoose.Schema.Types.Mixed,

    // Flags
    isDeleted: {
      type: Boolean,
      default: false,
      select: false,
    },
  },
  { timestamps: true }
);

// ✅ Indexes
TaskSchema.index({ projectId: 1, key: 1 }, { unique: true });
TaskSchema.index({ projectId: 1, sprintId: 1 });
TaskSchema.index({ assigneeId: 1 });
TaskSchema.index({ epicId: 1 });
TaskSchema.index({ parentId: 1 });

TaskSchema.methods.generateTaskCode = async function () {
  this.taskCode = generateTaskCode();
  return this.save();
};
export const Task = mongoose.models.Task || mongoose.model("Task", TaskSchema);

