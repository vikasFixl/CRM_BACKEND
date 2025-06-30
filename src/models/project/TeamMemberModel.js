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
    teamIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team",
      },
    ],
    role: {
      type: String,
      default: "viewer",
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    addedVia: {
      type: [String], // supports ["direct", "team"]
      default: [],
    },
    hasCustomPermission: {
      type: Boolean,
      default: false,
    },
    permissionsOverride: [
      {
        module: { type: String, required: true },
        actions: [{ type: String }],
      },
    ],
    preferences: {
      theme: {
        type: String,
        default: "light",
      },
      timezone: {
        type: String,
        default: "UTC",
      },
    },
    isRemoved: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// ✅ Enforce unique membership per project-user
ProjectMemberSchema.index({ projectId: 1, userId: 1 }, { unique: true });

// ✅ Optional static to get only active members
ProjectMemberSchema.statics.findActive = function (query = {}) {
  return this.find({ ...query, isRemoved: false });
};

export const ProjectMember =
  mongoose.models.ProjectMember ||
  mongoose.model("ProjectMember", ProjectMemberSchema);
