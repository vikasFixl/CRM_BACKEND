import mongoose from "mongoose";

// 💠 Column schema (board)
const ColumnSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    order: { type: Number, default: 0 },
    key: { type: String, required: true, lowercase: true, trim: true },
    color: { type: String, default: "#8e8e8e" },
    category: { type: String }, // e.g., "todo", "inprogress", "done"
  },
  { _id: false }
);

// 🔄 State schema (workflow)
const StateSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    category: { type: String }, // "backlog", "inprogress", "done", etc.
    color: { type: String, default: "#8e8e8e" },
    isDefault: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    onEnter: mongoose.Schema.Types.Mixed,
    onExit: mongoose.Schema.Types.Mixed,
  },
  { _id: false }
);

const TransitionSchema = new mongoose.Schema(
  {
    fromKey: { type: String, required: true }, // state key
    toKey: { type: String, required: true },   // state key
    fromOrder: { type: Number },               // index in states array
    toOrder: { type: Number },
    label: { type: String },
    requiresApproval: { type: Boolean, default: false },
    conditions: mongoose.Schema.Types.Mixed,
    actions: mongoose.Schema.Types.Mixed,
  },
  { _id: false }
);


// ⚙️ Automation rule schema
const AutomationRuleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    trigger: mongoose.Schema.Types.Mixed, // e.g., onCreate, onStatusChange
    conditions: mongoose.Schema.Types.Mixed,
    actions: mongoose.Schema.Types.Mixed,
  },
  { _id: false }
);

// 🔧 Settings schema
const SettingsSchema = new mongoose.Schema(
  {
    enableStoryPoints: { type: Boolean, default: false },
    enableEpics: { type: Boolean, default: false },
    enableSprints: { type: Boolean, default: false },
    defaultTaskTypes: {
      type: [String],
      default: ["task", "bug", "story"],
    },
    customFields: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
  },
  { _id: false }
);
const TaskTemplateSchema = new mongoose.Schema(
  {
    summary: { type: String, required: true },
    description: { type: String },
    type: {
      type: String,
      enum: ["task", "bug", "story", "epic"],
      default: "task",
    },
    status: { type: String, required: true },
    columnOrder: { type: Number, required: true },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
    },
    labels: [{ type: String }],
    storyPoints: { type: Number },
    isTemplateTask: { type: Boolean, default: true },
  },
  { _id: false } // Prevents Mongo from creating separate _id for each task in template
);

// 🏷 Issue Type schema
const IssueTypeSchema = new mongoose.Schema(
  {
    key: { type: String, required: true }, // "bug", "task", etc.
    name: { type: String, required: true }, // Display name
    color: { type: String, default: "#ccc" },
    icon: { type: String }, // Optional icon path/name
  },
  { _id: false }
);

// 📋 Final ProjectTemplate Schema
const ProjectTemplateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: String,

    boardType: {
      type: String,
      enum: ["scrum", "kanban", "bug-tracking"],
      required: true,
    },

    boardColumns: {
      type: [ColumnSchema],
      default: [],
    },

    workflow: {
      states: { type: [StateSchema], default: [] },
      transitions: { type: [TransitionSchema], default: [] },
    },

    automationRules: { type: [AutomationRuleSchema], default: [] },

    settings: { type: SettingsSchema, default: () => ({}) },

    issueTypes: {
      type: [IssueTypeSchema],
      default: [],
    },
    task: [TaskTemplateSchema],

    previewImage: { type: String }, // Optional preview image
    category: { type: String }, // e.g., "engineering", "qa"
    recommended: { type: Boolean, default: false },

    isSystem: { type: Boolean, default: false }, // true = non-deletable system template
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    baseTemplateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProjectTemplate",
      default: null,
    },
    version: { type: Number, default: 1 },
    isDraft: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ProjectTemplateSchema.index({ name: 1 }, { unique: true });

export const ProjectTemplate = mongoose.model(
  "ProjectTemplate",
  ProjectTemplateSchema
);
