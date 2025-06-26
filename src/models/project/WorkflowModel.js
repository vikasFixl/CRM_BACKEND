import mongoose from "mongoose";

const WorkflowSchema = new mongoose.Schema(
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
    states: [
      {
        key: { type: String, required: true, trim: true }, // system identifier
        name: { type: String, required: true, trim: true },       // Display name
        category: { type: String, trim: true },                   // Optional (no enum)
        color: { type: String, default: "#8e8e8e" },
        isDefault: { type: Boolean, default: false },
        order: { type: Number, default: 0 },
        onEnter: mongoose.Schema.Types.Mixed, // optional hooks
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
    isDeleted: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

WorkflowSchema.index({ projectId: 1, name: 1 }, { unique: true });

export const Workflow = mongoose.model("Workflow", WorkflowSchema);
