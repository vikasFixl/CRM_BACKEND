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
    key: {
      type: String,
      required: true,
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
    status: {
      type: String,
      required: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },

    // Assignment
    assigneeId: { // The person responsible for completing the task.
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reporterId: { //The person who created or reported the task/issue.
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
    startDate:{
      type: Date,
      default: Date.now(),
    },
    dueDate:{
      type: Date,
      default: Date.now(),
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

taskSchema.methods.generateTaskCode = async function () {
  this.key = generateTaskCode();
  return this.save();
};

export const Task = mongoose.models.Task || mongoose.model("Task", TaskSchema);

// // In controller/service
// const project = await Project.findById(projectId);
// const count = await Task.countDocuments({ projectId });

// const key = `${project.key}-${count + 1}`;

/**✅ Solution: Use a Flag in the Request
Request payload to create task
json
Copy
Edit
{
  "projectId": "proj123",
  "summary": "Refactor authentication",
  "type": "task"
}
Request payload to create subtask
json
Copy
Edit
{
  "projectId": "proj123",
  "summary": "Implement login form",
  "type": "task",
  "parentId": "task123"
}
✅ Backend logic
js
Copy
Edit
if (req.body.parentId) {
  // Treat as subtask
  const parentTask = await Task.findById(req.body.parentId);
  if (!parentTask) return res.status(400).send("Invalid parent task");
}

 * 
 * 
 * 
 */
