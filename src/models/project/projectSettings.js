import mongoose from "mongoose";

const ProjectSettingSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      unique: true,
    },

    // 🔢 ISSUE CONFIGURATION
    issuePrefix: { type: String, default: "ISSUE" },
    issueStartNumber: { type: Number, default: 1 },
    issueTypes: { type: [String], default: ["Task", "Bug", "Story"] },

    // 🎯 ESTIMATION SETTINGS
    estimation: {
      enabled: { type: Boolean, default: true },
      method: {
        type: String,
        enum: ["storyPoints", "time"],
        default: "storyPoints",
      },
    },

    // 🧾 BOARD CONFIGURATION
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
    },

    // ⏱️ TIME TRACKING SETTINGS
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
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("ProjectSetting", ProjectSettingSchema);