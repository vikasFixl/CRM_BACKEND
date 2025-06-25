import mongoose from "mongoose";

const ProjectTemplateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true }, // "Agile Scrum", "Bug Tracker", etc.
    description: { type: String },

    boardType: {
      type: String,
      enum: ["scrum", "kanban"],
      required: true,
    },

    columns: {
      type: [String], // ["Backlog", "To Do", "In Progress", "Done"]
      default: [],
    },

    workflow: {
      states: [
        {
          Key: { type: String, required: true, trim: true }, // system identifier
          name: { type: String, required: true, trim: true }, // Display name
          category: { type: String, trim: true }, // Optional (no enum)
          color: { type: String, default: "#8e8e8e" },
          isDefault: { type: Boolean, default: false },
          order: { type: Number, default: 0 },
          onEnter: mongoose.Schema.Types.Mixed, // optional hooks
          onExit: mongoose.Schema.Types.Mixed,
        },
      ], // ["To Do", "In Progress", "Done"]
      transitions: [
        {
          from: String,
          to: String,
          conditions: mongoose.Schema.Types.Mixed,
          actions: mongoose.Schema.Types.Mixed,
        },
      ],
    },

    automationRules: [
      {
        name: String,
        description: String,
        trigger: mongoose.Schema.Types.Mixed,
        conditions: mongoose.Schema.Types.Mixed,
        actions: mongoose.Schema.Types.Mixed,
      },
    ],

    settings: {
      enableStoryPoints: { type: Boolean, default: false },
      enableEpics: { type: Boolean, default: false },
      enableSprints: { type: Boolean, default: false },
      defaultTaskTypes: [String], // ["task", "bug", "story"]
    },

    isSystem: { type: Boolean, default: false }, // true = system templates (non-deletable)
  },
  { timestamps: true }
);

ProjectTemplateSchema.index({ name: 1 }, { unique: true });

export const ProjectTemplate = mongoose.model(
  "ProjectTemplate",
  ProjectTemplateSchema
);
