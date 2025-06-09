import { Schema, model } from "mongoose";
import { ROLES, MODULES ,PERMISSIONS} from "../enums/role.enums.js";

const RolePermissionSchema = new Schema({
  role: {
    type: String,
    required: true,
    enum: Object.values(ROLES),
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
         enum:Object.values(PERMISSIONS),
        },
      ],
    },
  ],
});

export const RolePermission = model("RolePermission", RolePermissionSchema);
