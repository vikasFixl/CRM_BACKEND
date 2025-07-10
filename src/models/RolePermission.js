import mongoose from "mongoose";
// import { ROLE_SCOPE } from "../../enums/roleScope.enum.js";
export const ROLE_SCOPE = {
  ORGANIZATION: "x1o",  // org-level
  WORKSPACE: "x2w",     // workspace-level
  PROJECT: "x3p",       // project-level
  TEAM: "x4t",          // team-level
};
export const SCOPE_LABELS = {
  x1o: "organization",
  x2w: "workspace",
  x3p: "project",
  x4t: "team",
};
const rolePermissionSchema = new mongoose.Schema(
  {
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      default: null,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      default: null,
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      default: null,
    },

    role: {
      type: String,
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    scope: {
      type: String,
      enum: Object.values(ROLE_SCOPE),
      required: true,
    },

    isCustom: {
      type: Boolean,
      default: true,
    },

    permissions: [
      {
        module: String, // or use ENUM if you have one
        actions: [String],
      },
    ],
  },
  { timestamps: true }
);

export const RolePermission = mongoose.model("RolePermission", rolePermissionSchema);
