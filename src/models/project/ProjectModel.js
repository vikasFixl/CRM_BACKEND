import mongoose from "mongoose";

const projectSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    emoji: {
      type: String,
      required: true,
      default: "🚀",
    },
    description: {
      type: String,
    },
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isDeleted:{
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// Optionally ensure name uniqueness per workspace
// projectSchema.index({ workspace: 1, name: 1 }, { unique: true });

export const Project = mongoose.model("Project", projectSchema);
