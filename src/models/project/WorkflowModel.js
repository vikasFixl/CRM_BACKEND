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
        key: { type: String, required: true, trim: true },
        name: { type: String, required: true, trim: true },
        category: { type: String, trim: true },
        color: { type: String, default: "#8e8e8e" },
        isDefault: { type: Boolean, default: false },
        order: { type: Number, default: 0 },
      },
    ],
    transitions: [
      {
        fromKey: { type: String, required: true },           // system key (e.g., "todo")
        toKey: { type: String, required: true },             // system key (e.g., "inprogress")

        fromOrder: { type: Number, required: true },                         // optional: index of source column
        toOrder: { type: Number, required: true },                           // optional: index of target column

        label: { type: String },                             // transition name (e.g., "Start Progress")
        requiresApproval: { type: Boolean, default: false }, // manual approval before transitioning
      },
    ],

    isDefaultWorkflow: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// Ensure either projectId or teamId is provided
WorkflowSchema.pre("validate", function (next) {
  if (!this.projectId && !this.teamId) {
    return next(new Error("Either projectId or teamId must be set."));
  }
  next();
});

// Ensure unique workflow name per project or team
WorkflowSchema.index({ projectId: 1, teamId: 1, name: 1 }, { unique: true, sparse: true });

export const Workflow = mongoose.model("Workflow", WorkflowSchema);
