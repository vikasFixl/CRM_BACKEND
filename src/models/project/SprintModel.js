import mongoose from "mongoose";

const SprintSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    goal: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: null,
    }
  },
  { timestamps: true }
);

// Indexes for performance
SprintSchema.index({ projectId: 1, startDate: 1 });
SprintSchema.index({ projectId: 1, name: 1 }, { unique: true });
SprintSchema.index({ isDeleted: 1 });

export const Sprint = mongoose.model("Sprint", SprintSchema);
/*
✅ Should You Use Sprints?
It depends on how your teams plan and track work. Here's a breakdown to help you decide:

🧭 If You're Using Scrum Teams → Yes, Use Sprints
Use Sprints if:
You work in time-boxed iterations (e.g., 2-week cycles)


Your team does Sprint Planning, Daily Standups, Sprint Reviews


You want to measure velocity, burndown, and predictability


You need clear goals per cycle (e.g., “Finish user authentication flow this sprint”)


➡️ Use Sprints for:
Agile development teams


Structured planning & tracking


Retrospectives & forecasting future work



🧭 If You're Using Kanban or Continuous Flow → No, Skip Sprints
Don’t use Sprints if:
Your work is continuous and flexible (e.g., support, ops, bug triage)


You don’t plan in time-boxed chunks


You focus on WIP limits, cycle time, and flow efficiency


➡️ Skip Sprints for:
DevOps teams, support desks, and marketing


Real-time task flow without strict deadlines



🧩 What Jira Does:
Supports both Scrum (Sprints) and Kanban (No Sprints)


Each Project has a type: kanban, scrum, etc.


In Scrum Projects, tasks can be pulled into Sprints


In Kanban Projects, tasks flow continuously on the board

*/