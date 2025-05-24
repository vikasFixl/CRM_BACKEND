import { Schema, model } from "mongoose";

// Enums
const ROLES = {
  ORG_ADMIN: "OrgAdmin",
  MANAGER: "Manager",
  SUPPORT_AGENT: "SupportAgent",
  USER: "User",
  CUSTOM: "Custom",
};

const MODULES = {
  DASHBOARD: "dashboard",
  CONTACTS: "contacts",
  LEADS: "leads",
  TICKETS: "tickets",
  USERS: "users",
  SETTINGS: "settings",
  REPORTS: "reports",
  BILLING: "billing",
};

const VALID_ACTIONS = {
  VIEW: "view",
  CREATE: "create",
  EDIT: "edit",
  DELETE: "delete",
  ASSIGN: "assign",
  EXPORT: "export",
  UPDATE_STATUS: "update-status",
  CLOSE: "close",
  COMMENT: "comment",
  INVITE: "invite",
  REMOVE: "remove",
  CHANGE_ROLE: "change-role",
  DISABLE: "disable",
  UPDATE: "update",
  DOWNLOAD: "download",
  FILTER: "filter",
  UPGRADE_PLAN: "upgrade-plan",
  MANAGE_PAYMENT: "manage-payment",
  VIEW_INVOICES: "view-invoices",
};

const RolePermissionSchema = new Schema({
  orgId: {
    type: Schema.Types.ObjectId,
    ref: "Organization",
    required: true,
    index: true,
  },
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
          enum: Object.values(VALID_ACTIONS),
        },
      ],
    },
  ],
}, { timestamps: true });

RolePermissionSchema.index({ orgId: 1, role: 1 }, { unique: true });


export const RolePermission = model("RolePermission", RolePermissionSchema);

// Export all enums for reuse
export { ROLES, MODULES, VALID_ACTIONS };
