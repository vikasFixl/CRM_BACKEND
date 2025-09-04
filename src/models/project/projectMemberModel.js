import mongoose from "mongoose";

const ProjectMemberSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team", // Optional: if user is part of a team assigned to the project
    },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RolePermission",
      required: true,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    addedVia: {
      type: String,
      enum: ["direct", "team"],
      default: "direct",
    },
    hasCustomPermission: {
      type: Boolean,
      default: false,
    },
    permissionsOverride: [
      {
        module: { type: String, required: true }, // Example: "task", "issue"
        actions: [{ type: String }], // Example: ["CREATE", "EDIT", "DELETE"]
      },
    ],
    removeReason: {
      type: String,
      default: "",
      select: false,
    },
    isRemoved: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// ✅ Ensure a user is added only once per project
ProjectMemberSchema.index({ projectId: 1, userId: 1 }, { unique: true });

// Optional index for fast member listing by project
ProjectMemberSchema.index({ projectId: 1 });

// Optional static method to get only active (non-removed) members
ProjectMemberSchema.statics.findActive = function (query = {}) {
  return this.find({ ...query, isRemoved: false });
};

export const ProjectMember =
  mongoose.models.ProjectMember ||
  mongoose.model("ProjectMember", ProjectMemberSchema);
