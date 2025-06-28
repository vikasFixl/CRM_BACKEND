import { Schema, model } from "mongoose";
import { ROLES, MODULES, PERMISSIONS } from "../enums/role.enums.js";
import mongoose from "mongoose";

const RolePermissionSchema = new Schema({
  orgId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
  },
  role: {
    type: String,
    required: true,
    enum: Object.values(ROLES),
  },
  name: {
    type: String,
    required: true,
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

export const RolePermission = model("RolePermission", RolePermissionSchema);
