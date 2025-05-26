import { Schema, model } from "mongoose";

// Enums
const ROLES = {
  ORG_ADMIN: "OrgAdmin",
  MANAGER: "Manager",
  SUPPORT_AGENT: "SupportAgent",
  USER: "User",
  CUSTOM: " ",
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
   ARCHIVE: "archive",                  // For archiving records (jobs, users, etc.)
  RESTORE: "restore",                  // Restore from archive
  VIEW_AUDIT_LOG: "view-audit-log",    // Super admin
  MANAGE_ORG_SETTINGS: "manage-org-settings", // Super admin
  VIEW_USERS_ALL_ORGS: "view-users-all-orgs", // Super admin
  MANAGE_ROLES: "manage-roles",        // Manage all roles & permissions
  ACCESS_DEV_TOOLS: "access-dev-tools" // Feature flag access, system-wide tools
};

const RolePermissionSchema = new Schema({
  role: {
    type: String,
    required: true,
    enum: Object.values(ROLES), // Dynamic enum from ROLES object
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
          default: [],
        },
      ],
    },
  ],
});

export const RolePermission = model("RolePermission", RolePermissionSchema);

// Export all enums for reuse
export { ROLES, MODULES, VALID_ACTIONS };
