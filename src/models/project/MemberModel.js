import mongoose from "mongoose";

const MemberSchema = new mongoose.Schema(
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
      ref: "RolePermission",
      required: true,
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
    joinedAt: {
      type: Date,
      default: Date.now,
    },
 
    status: {
      type: String,
      default: "active", // enums like invited/pending can be added later
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    removalReason: {
      type: String,
      maxlength: 500,
      select: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      select: false,
    },
  },
  { timestamps: true }
);

// Unique membership constraint per workspace + org
MemberSchema.index(
  { workspaceId: 1, userId: 1, organizationId: 1 },
  { unique: true }
);

// Static to filter active members
MemberSchema.statics.findActive = function (query = {}) {
  return this.find({ ...query, isDeleted: false });
};
//const members = await Member.findActive({ workspaceId: someId }); use of about statics

export const Member =
  mongoose.models.Member || mongoose.model("workspaceMember", MemberSchema);
