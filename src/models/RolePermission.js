import mongoose from "mongoose";
import { ROLES, MODULES, PERMISSIONS, ROLE_SCOPE } from "../enums/role.enums.js";


const rolePermissionSchema = new mongoose.Schema(
  {
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      index: true,
    },

    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      default: null,
    },

    // projectId: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Project",
    //   default: null,
    // },

    // teamId: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Team",
    //   default: null,
    // },

    role: {
      type: String,
      enum: Object.values(ROLES),
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
        module: {
          type: String,
          enum: Object.values(MODULES),
          required: true,
        },
        actions: [
          {
            type: String,
            enum: Object.values(PERMISSIONS),
            required: true,
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

export const RolePermission = mongoose.model("RolePermission", rolePermissionSchema);
