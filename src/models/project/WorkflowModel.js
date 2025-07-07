import mongoose from "mongoose";

const WorkflowSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      default: null,
      index: true,
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      default: null,
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

    states: [
      {
        key: { type: String, required: true, trim: true },      // system key (e.g., "todo")
        name: { type: String, required: true, trim: true },     // display label (e.g., "To Do")
        category: { type: String, trim: true },                 // optional: "backlog", "inprogress", etc.
        color: { type: String, default: "#8e8e8e" },            // UI color
        isDefault: { type: Boolean, default: false },           // initial state
        order: { type: Number, default: 0 },                    // display order
        onEnter: mongoose.Schema.Types.Mixed,                   // optional hook
        onExit: mongoose.Schema.Types.Mixed,
      },
    ],

    transitions: [
      {
        from: { type: String, required: true },
        to: { type: String, required: true },
        label: { type: String },
        requiresApproval: { type: Boolean, default: false },
        conditions: mongoose.Schema.Types.Mixed,
        actions: mongoose.Schema.Types.Mixed,
      },
    ],

    isDefaultWorkflow: { type: Boolean, default: false },       // reusable template flag
    isDeleted: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// ✅ At least one of projectId or teamId must be present
WorkflowSchema.pre("validate", function (next) {
  if (!this.projectId && !this.teamId) {
    return next(new Error("Either projectId or teamId must be set."));
  }
  next();
});

// ✅ Unique name within project or team (if provided)
WorkflowSchema.index({ projectId: 1, teamId: 1, name: 1 }, { unique: true, sparse: true });

export const Workflow = mongoose.model("Workflow", WorkflowSchema);
