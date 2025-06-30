import { Schema, model } from "mongoose";
import { ROLES, MODULES, PERMISSIONS } from "../enums/role.enums.js";
import mongoose from "mongoose";
const RolePermissionSchema = new Schema({
  orgId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
    required: true,
  },
  workspaceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Workspace",
    default: null, // Null → org-level role
  },
  role: {
    type: String,
    required: true,
    enum: Object.values(ROLES),
  },
  name: {
    type: String,
    required: true,
    trim: true, // e.g. "Custom Sales Manager"
  },
  isCustom: {
    type: Boolean,
    required: true,
    default: false,
  },
  permissions: [
    {
      module: {
        type: String,
        required: true,
        enum: Object.values(MODULES),
      },
      actions: [
        {
          type: String,
          required: true,
          enum: Object.values(PERMISSIONS),
        },
      ],
    },
  ],
});

RolePermissionSchema.index({ orgId: 1, workspaceId: 1, role: 1 }, { unique: true });

export const RolePermission = model("RolePermission", RolePermissionSchema);
