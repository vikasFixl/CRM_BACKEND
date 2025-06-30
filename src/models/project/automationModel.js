import mongoose from "mongoose";

const AutomationRuleSchema = new mongoose.Schema(
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
      maxlength: 1000,
    },
    trigger: {
      type: mongoose.Schema.Types.Mixed, // Flexible JSON for event triggers, e.g. { event: "task_created" }
      required: true,
    },
    conditions: {
      type: mongoose.Schema.Types.Mixed, // Optional JSON filter criteria for trigger, e.g. { status: "in_progress" }
      default: {},
    },
    actions: {
      type: mongoose.Schema.Types.Mixed, // JSON describing what actions to perform, e.g. { assignTo: "managerId" }
      required: true,
    },
    enabled: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      select: false, // Hide by default in queries unless explicitly selected
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// Compound unique index on project + name
AutomationRuleSchema.index({ projectId: 1, name: 1 }, { unique: true });

// Static method to get only active (not deleted) rules
AutomationRuleSchema.statics.findActive = function (filter = {}) {
  return this.find({ ...filter, isDeleted: false });
};

// Query helper for chaining active filter
AutomationRuleSchema.query.active = function () {
  return this.where({ isDeleted: false });
};

// Query helper for filtering enabled rules
AutomationRuleSchema.query.enabled = function () {
  return this.where({ enabled: true });
};

export const AutomationRule = mongoose.model("AutomationRule", AutomationRuleSchema);
