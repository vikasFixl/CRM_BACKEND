import mongoose from "mongoose";

const TeamMemberSchema = new mongoose.Schema(
  {
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    // ref to proejct member

    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProjectMember"
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
  },
  { timestamps: true }
);

// ✅ Unique index per team-user pair
TeamMemberSchema.index({ teamId: 1, member: 1 }, { unique: true });

// ✅ Optional: fast lookup by team
TeamMemberSchema.index({ teamId: 1 });

// ✅ Optional: lookup by project
TeamMemberSchema.index({ projectId: 1 });



export const TeamMember =
  mongoose.models.TeamMember || mongoose.model("TeamMember", TeamMemberSchema);
