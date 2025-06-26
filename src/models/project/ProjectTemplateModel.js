import mongoose from "mongoose";

const StateSchema = new mongoose.Schema({
  key: { type: String, required: true, trim: true },
  name: { type: String, required: true, trim: true },
  category: { type: String },
  color: { type: String, default: "#8e8e8e" },
  isDefault: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
  onEnter: mongoose.Schema.Types.Mixed,
  onExit: mongoose.Schema.Types.Mixed,
}, { _id: false });

const TransitionSchema = new mongoose.Schema({
  from: { type: String, required: true },
  to: { type: String, required: true },
  conditions: mongoose.Schema.Types.Mixed,
  actions: mongoose.Schema.Types.Mixed,
}, { _id: false });

const AutomationRuleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  trigger: mongoose.Schema.Types.Mixed,
  conditions: mongoose.Schema.Types.Mixed,
  actions: mongoose.Schema.Types.Mixed,
}, { _id: false });

const SettingsSchema = new mongoose.Schema({
  enableStoryPoints: { type: Boolean, default: false },
  enableEpics: { type: Boolean, default: false },
  enableSprints: { type: Boolean, default: false },
  defaultTaskTypes: {
    type: [String],
    default: ["task", "bug", "story"]
  },
  customFields: {
    type: [mongoose.Schema.Types.Mixed],
    default: []
  }
}, { _id: false });

// const ColumnSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   wipLimit: { type: Number, default: 0 },
//   stateKey: { type: String },
//   order: { type: Number, default: 0 },
// }, { _id: false });

const IssueTypeSchema = new mongoose.Schema({
  key: { type: String, required: true },
  name: { type: String, required: true },
  color: { type: String, default: "#ccc" },
  icon: { type: String },
}, { _id: false });

const ProjectTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: String,

  boardType: {
    type: String,
    enum: ["scrum", "kanban", "bug-tracking"],
    required: true,
  },

  // boardColumns: { // renamed from columns for clarity
  //   type: [ColumnSchema],
  //   default: [],
  // },

  workflow: {
    states: { type: [StateSchema], default: [] },
    transitions: { type: [TransitionSchema], default: [] }
  },

  automationRules: { type: [AutomationRuleSchema], default: [] },

  settings: { type: SettingsSchema, default: () => ({}) },

  issueTypes: {
    type: [IssueTypeSchema],
    default: []
  },

  previewImage: { type: String }, // optional preview for UI
  category: { type: String },     // e.g., "engineering", "qa"
  recommended: { type: Boolean, default: false },

  isSystem: { type: Boolean, default: false }, // non-deletable
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  baseTemplateId: { type: mongoose.Schema.Types.ObjectId, ref: "ProjectTemplate", default: null },
  version: { type: Number, default: 1 },
  isDraft: { type: Boolean, default: false },

}, { timestamps: true });

ProjectTemplateSchema.index({ name: 1 }, { unique: true });

export const ProjectTemplate = mongoose.model("ProjectTemplate", ProjectTemplateSchema);
