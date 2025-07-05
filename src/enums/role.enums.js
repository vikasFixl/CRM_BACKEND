// enums/role.enum.js

// enums/roles.enum.js

export const ROLES = {
  // 🌐 Organization-level Roles
  SUPER_ADMIN: "SuperAdmin",
  ORG_ADMIN: "OrgAdmin",
  MANAGER: "Manager",
  SUPPORT_AGENT: "SupportAgent",
  USER: "User",
  CUSTOM: "Custom", // For override-based roles

  // 🏢 Workspace-level Roles
  WORKSPACE_ADMIN: "WorkspaceAdmin",
  WORKSPACE_MEMBER: "WorkspaceMember",
  WORKSPACE_VIEWER: "WorkspaceViewer",

  // 👥 Team-level Roles
  TEAM_ADMIN: "TeamAdmin",
  TEAM_MEMBER: "TeamMember",
  TEAM_VIEWER: "TeamViewer",

  // 📁 Project-level Roles
  PROJECT_ADMIN: "ProjectAdmin",
  PROJECT_MEMBER: "ProjectMember",
  PROJECT_VIEWER: "ProjectViewer"
};

export const MODULES = {
  USER: "user",
  ORGANIZATION: "organization",
  FIRM: "firm",
  LEAD: "lead",
  INVOICE: "invoice",
  CLIENT: "client",
  TAX: "tax",
  BILLING: "billing",
  PROJECT: "project", // umbrella for workspace, project, task, member
  PERMISSIONS: "permissions"
};

/**
 * Complete System Permissions
 * Organized by module with new additions marked with ✅
 */
export const PERMISSIONS = {
  // 👤 USER MODULE
  USER: {
    CREATE: "CREATE_USER",
    DELETE: "DELETE_USER",
    SUSPEND: "SUSPEND_USER",
    VIEW_PROFILE: "VIEW_USER_PROFILE",  
    UPDATE_PROFILE: "UPDATE_USER_PROFILE", 
    RESET_PASSWORD: "RESET_USER_PASSWORD",  
    MANAGE_SESSIONS: "MANAGE_USER_SESSIONS" 
  },

  // 🏢 ORGANIZATION MODULE
  ORGANIZATION: {
    CREATE: "CREATE_ORGANIZATION",
    EDIT: "EDIT_ORGANIZATION",
    DELETE: "DELETE_ORGANIZATION",
    SUSPEND: "SUSPEND_ORGANIZATION",
    INVITE: "SEND_INVITATION",
    REMOVE_MEMBER: "DELETE_ORG_USER",
    UPDATE_MEMBER: "UPDATE_ORG_USER",
    VIEW_MEMBERS: "VIEW_ORG_USER",
    APPROVE_MEMBER: "APPROVE_ORG_USER",
    EXPORT_DATA: "EXPORT_ORG_DATA",  
    VIEW_ANALYTICS: "VIEW_ORG_ANALYTICS"  
  },

  // 🏛️ FIRM MODULE
  FIRM: {
    CREATE: "CREATE_FIRM",
    EDIT: "EDIT_FIRM",
    DELETE: "DELETE_FIRM",
    SUSPEND: "SUSPEND_FIRM",
    RESTORE: "RESTORE_FIRM",
    VIEW_TRASH: "VIEW_TRASH",
    MERGE: "MERGE_FIRMS"  
  },

  // 💰 FINANCE MODULE
  FINANCE: {
    INVOICE: {
      CREATE: "CREATE_INVOICE",
      EDIT: "EDIT_INVOICE",
      DELETE: "DELETE_INVOICE",
      EXPORT: "EXPORT_INVOICE",
      RESTORE: "RESTORE_INVOICE",
      APPROVE: "APPROVE_INVOICE"  // ✅
    },
    TAX: {
      CREATE: "CREATE_TAX",
      EDIT: "EDIT_TAX",
      DELETE: "DELETE_TAX",
      RESTORE: "RESTORE_TAX",
      CALCULATE: "CALCULATE_TAX"  
    },
    BILLING: {
      CREATE_PLAN: "CREATE_BILLING_PLAN",
      EDIT_PLAN: "EDIT_BILLING_PLAN",
      DELETE_PLAN: "DELETE_BILLING_PLAN",
      PROCESS_PAYMENT: "PROCESS_BILLING_PAYMENT",  
      ISSUE_REFUND: "ISSUE_BILLING_REFUND"  
    }
  },

  // 🤝 CLIENT RELATIONSHIP MODULE
  CRM: {
    CLIENT: {
      CREATE: "CREATE_CLIENT",
      EDIT: "EDIT_CLIENT",
      DELETE: "DELETE_CLIENT",
      RESTORE: "RESTORE_CLIENT",
      IMPORT: "IMPORT_CLIENTS"  
    },
    LEAD: {
      CREATE: "CREATE_LEAD",
      EDIT: "EDIT_LEAD",
      DELETE: "DELETE_LEAD",
      RESTORE: "RESTORE_LEAD",
      CONVERT: "CONVERT_LEAD"  
    }
  },

  // 🏗️ PROJECT MODULE
  PROJECT: {
    WORKSPACE: {
      CREATE: "CREATE_WORKSPACE",
      EDIT: "EDIT_WORKSPACE",
      DELETE: "DELETE_WORKSPACE",
      SETTINGS: "MANAGE_WORKSPACE_SETTINGS",
      TRANSFER: "TRANSFER_OWNERSHIP",
      ARCHIVE: "ARCHIVE_WORKSPACE",
      ANALYTICS: "VIEW_WORKSPACE_ANALYTICS",
      TEMPLATE: "CREATE_WORKSPACE_TEMPLATE"
    },
    PROJECT: {
      CREATE: "CREATE_PROJECT",
      EDIT: "EDIT_PROJECT",
      DELETE: "DELETE_PROJECT",
      LEAD: "ASSIGN_PROJECT_LEAD",
      ARCHIVE: "ARCHIVE_PROJECT",
      ACTIVITY: "VIEW_PROJECT_ACTIVITY",
      BUDGET: "MANAGE_PROJECT_BUDGET"  
    },
    TASK: {
      CREATE: "CREATE_TASK",
      EDIT: "EDIT_TASK",
      DELETE: "DELETE_TASK",
      ASSIGN: "ASSIGN_TASK",
      COMMENT: "COMMENT_ON_TASK",
      STATUS: "CHANGE_TASK_STATUS",
      PRIORITY: "SET_TASK_PRIORITY" 
    }
  },

  // 👥 TEAM MODULE
  TEAM: {
    CREATE: "CREATE_TEAM",
    EDIT: "EDIT_TEAM",
    DELETE: "DELETE_TEAM",
    ADD_MEMBER: "ADD_TEAM_MEMBER",
    REMOVE_MEMBER: "REMOVE_TEAM_MEMBER",
    ASSIGN_ROLE: "ASSIGN_TEAM_ROLE",
    SETTINGS: "MANAGE_TEAM_SETTINGS",
    PERMISSIONS: "MANAGE_TEAM_PERMISSIONS" 
  },

  // 🔐 SECURITY MODULE
  SECURITY: {
    ROLE: {
      CREATE: "CREATE_ROLE",
      EDIT: "EDIT_ROLE",
      DELETE: "DELETE_ROLE",
      ASSIGN: "ASSIGN_ROLE"
    },
    PERMISSION: {
      MANAGE: "MANAGE_PERMISSIONS",
      AUDIT: "AUDIT_PERMISSIONS"  
    },
    ACCESS: {
      VIEW_AUDIT_LOGS: "VIEW_AUDIT_LOGS",  
      EXPORT_AUDIT_LOGS: "EXPORT_AUDIT_LOGS"  
    }
  },

  // 📄 DOCUMENTS MODULE
  DOCUMENTS: {
    UPLOAD: "UPLOAD_DOCUMENT",  
    DOWNLOAD: "DOWNLOAD_DOCUMENT",  
    SHARE: "SHARE_DOCUMENT",  
    VERSION: "MANAGE_DOCUMENT_VERSIONS",  
    DELETE: "DELETE_DOCUMENT"  
  },

  // 🔗 INTEGRATIONS MODULE
  INTEGRATIONS: {
    CONNECT: "INTEGRATE_THIRD_PARTY_APPS",
    MANAGE: "MANAGE_INTEGRATIONS",  
    WEBHOOKS: "MANAGE_WEBHOOKS"  
  },

  // 📊 REPORTS MODULE
  REPORTS: {
    GENERATE: "GENERATE_REPORT",
    EXPORT: "EXPORT_DATA",
    SCHEDULE: "SCHEDULE_REPORTS",  
    SHARE: "SHARE_REPORTS"  
  },

  // 👁️ VIEW PERMISSIONS
  VIEW: {
    ALL: "VIEW_ONLY",
    LIMITED: "VIEW_LIMITED_ACCESS",  
    SELF: "VIEW_SELF_DATA_ONLY"  
  }
};

// Flattened permissions array for easy checking
export const ALL_PERMISSIONS = Object.values(PERMISSIONS).reduce((acc, module) => {
  const flatten = (obj, prefix = '') => {
    Object.entries(obj).forEach(([key, value]) => {
      if (typeof value === 'object') {
        flatten(value, `${prefix}${key}_`);
      } else {
        acc.push(value);
      }
    });
    return acc;
  };
  return flatten(module);
}, []);