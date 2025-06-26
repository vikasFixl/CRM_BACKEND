import mongoose from "mongoose";

const ProjectSettingSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      unique: true,
    },

    // 🧩 ISSUE CONFIGURATION
    issuePrefix: { type: String, default: "ISSUE" }, // like "PROJ-123"
    issueStartNumber: { type: Number, default: 1 },
    defaultIssueType: { type: String, default: "Task" }, // Task, Bug, Story

    // 🎯 ESTIMATION SETTINGS
    estimation: {
      enabled: { type: Boolean, default: true },
      method: {
        type: String,
        enum: ["storyPoints", "time"], // "storyPoints" or "originalEstimate"
        default: "storyPoints",
      },
    },

    // 🛠️ WORKFLOW
    defaultWorkflowId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workflow",
    },

    // 📋 BOARD CONFIGURATION
    boardConfig: {
      swimlanes: {
        type: String,
        enum: ["assignee", "epic", "priority", "none"],
        default: "none",
      },
      grouping: {
        type: String,
        enum: ["status", "priority", "assignee"],
        default: "status",
      },
      filters: {
        type: Map,
        of: [String], // e.g., { status: ["To Do", "In Progress"], priority: ["High"] }
        default: {},
      },
    },

    // 📬 NOTIFICATION SETTINGS
    notificationSettings: {
      onTaskCreated: { type: Boolean, default: true },
      onStatusChanged: { type: Boolean, default: true },
      onCommentAdded: { type: Boolean, default: true },
      onAssigned: { type: Boolean, default: true },
    },

    // 👤 DEFAULT ASSIGNEES
    defaultAssignee: {
      type: String,
      enum: ["projectLead", "unassigned", "componentLead"],
      default: "unassigned",
    },

    // ⏱️ TIME TRACKING
    timeTracking: {
      enabled: { type: Boolean, default: true },
      workingHoursPerDay: { type: Number, default: 8 },
      workingDaysPerWeek: { type: Number, default: 5 },
      defaultUnit: {
        type: String,
        enum: ["minutes", "hours", "days"],
        default: "hours",
      },
    },

    // 🔐 PERMISSION TOGGLES
    restrictions: {
      restrictEditingDoneTasks: { type: Boolean, default: true },
      restrictTaskDeletion: { type: Boolean, default: false },
    },

    // 🤖 AUTOMATION RULES
    automationEnabled: { type: Boolean, default: true },

    // 🧾 TEMPLATES
    taskTemplates: [
      {
        name: String,
        fields: mongoose.Schema.Types.Mixed, // includes default summary, description, etc.
        isDefault: { type: Boolean, default: false },
      },
    ],

    // 🚨 SLA & ESCALATION (for support workflows)
    sla: {
      enabled: { type: Boolean, default: false },
      defaultResponseTime: Number, // in hours
      defaultResolutionTime: Number, // in hours
    },

    // 🏷️ LABELS & COMPONENTS (managed at project level)
    components: [{ name: String, description: String }],
    labels: [String],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("ProjectSetting", ProjectSettingSchema);
