import mongoose from "mongoose";
const MemberSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RolePermission", // Role like ProjectAdmin, ProjectViewer
      required: true,
    },
    permissionsOverride: [
      {
        module: { type: String }, // e.g., "project"
        actions: [{ type: String }], // e.g., ["CREATE_TASK", "DELETE_PROJECT"]
      },
    ],
    hasCustomPermission: {
      type: Boolean,
      default: false,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

MemberSchema.index({ workspaceId: 1, userId: 1, organizationId: 1 });

export const Member = mongoose.model("MemberSchema", MemberSchema);
