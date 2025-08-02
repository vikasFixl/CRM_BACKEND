// enums/role.enum.js

// enums/roles.enum.js
// if (!user.permissions.includes("SUPPORT_ORG_LOGIN")) {
//   throw new Error("Access denied: No support impersonation rights");
// }

// if (!user.permissions.includes("SUPPORT_VIEW_USERS")) {
//   throw new Error("Support agent cannot view users in this org");
// }


export const ROLES = {
  // 🌐 Platform-level Roles (Global access to entire SaaS system)
  SUPER_ADMIN: "SuperAdmin",          // Full platform control
  PLATFORM_ADMIN: "PlatformAdmin",       // Administers platform-wide settings
  PLATFORM_SUPPORT: "PlatformSupport",     // Support for all organizations
  PLATFORM_BILLING_OPS: "PlatformBillingOps",  // Handles billing and taxation
  PLATFORM_DEVOPS: "PlatformDevOps",      // Infrastructure, monitoring
  PLATFORM_ANALYST: "PlatformAnalyst",     // Reviews global reports
  PLATFORM_CUSTOM: "PlatformCustom",      // For future/custom system-wide roles

  // 🏢 Organization-level Roles (For managing firms/clients)
  ORG_OWNER: "OrgOwner",         // Owns and controls the organization
  ORG_ADMIN: "OrgAdmin",         // Manages users, settings, security
  MANAGER: "Manager",          // Middle management, manages modules like leads, tasks
  SUPPORT_AGENT: "SupportAgent",     // Handles support queries
  FINANCE_MANAGER: "FinanceManager",   // Handles invoices, tax, expenses
  SALES_MANAGER: "SalesManager",     // Manages leads, deals, contacts
  SALES_REP: "SalesRep",         // Executes sales activities
  ORG_ANALYST: "OrgAnalyst",       // Views reports, analytics
  CLIENT_CONTACT: "ClientContact",    // Client-side person interacting with system
  ORG_CUSTOM: "OrgCustom",        // Custom org-level role

  // 🧱 Workspace-level Roles (Used to group teams/projects)
  WORKSPACE_ADMIN: "WorkspaceAdmin",    // Manages workspace-wide settings
  WORKSPACE_MEMBER: "WorkspaceMember",   // Collaborates on projects
  WORKSPACE_VIEWER: "WorkspaceViewer",   // View-only
  WORKSPACE_CUSTOM: "WorkspaceCustom",   // Custom role for workspace

  // 👥 Team-level Roles (For cross-functional teams)
  TEAM_ADMIN: "TeamAdmin",     // Manages team structure, members
  TEAM_LEAD: "TeamLead",      // Leads a team, assigns work
  TEAM_MEMBER: "TeamMember",    // Participates actively in team tasks
  TEAM_VIEWER: "TeamViewer",    // Passive member, read-only
  TEAM_CUSTOM: "TeamCustom",    // Custom team role

  // 📁 Project-level Roles (Project-based access control)
  PROJECT_ADMIN: "ProjectAdmin",    // Controls project, workflow, permissions
  PROJECT_MANAGER: "ProjectManager",  // Plans and oversees execution
  PROJECT_LEAD: "ProjectLead",     // Leads implementation
  PROJECT_MEMBER: "ProjectMember",   // Works on tasks
  PROJECT_VIEWER: "ProjectViewer",   // Read-only access to project
  PROJECT_CUSTOM: "ProjectCustom",   // Custom project-level role
};


export const MODULES = {
  PLATFORM_SETTINGS: "platformSettings",
  PLATFORM_BILLING: "platformBilling",
  PLATFORM_ANALYTICS: "platformAnalytics",
  PLATFORM_SUPPORT: "platformSupport",
  PLATFORM_USERS: "platformUsers",
  PLATFORM_AUDIT_LOGS: "platformAuditLogs",
  PLATFORM_ROLES: "platformRoles",
  PLATFORM_CLIENTS: "platformClients",
  PLATFORM_ORGANIZATIONS: "platformOrganizations",
  PLATFORM_INVOICES: "platformInvoices",
  PLATFORM_REPORTS: "platformReports",

  // 🏢 Organization-Level Modules (Client/Company level)
  ORG_PROFILE: "orgProfile",
  ORG_USERS: "orgUsers",
  ORG_ROLES: "orgRoles",
  ORG_PERMISSIONS: "orgPermissions",
  ORG_BILLING: "orgBilling",
  ORG_INVOICES: "orgInvoices",
  ORG_LEADS: "orgLeads",
  ORG_CONTACTS: "orgContacts",
  ORG_CLIENTS: "orgClients",
  ORG_TASKS: "orgTasks",
  ORG_NOTES: "orgNotes",
  ORG_FILES: "orgFiles",
  ORG_EMAILS: "orgEmails",
  ORG_SUPPORT: "orgSupport",
  ORG_ANALYTICS: "orgAnalytics",
  ORG_AUDIT_LOGS: "orgAuditLogs",

  // 🧱 Workspace-Level Modules (used to organize teams/projects)
  WORKSPACE_SETTINGS: "workspaceSettings",
  WORKSPACE_USERS: "workspaceUsers",
  WORKSPACE_TEAMS: "workspaceTeams",
  WORKSPACE_PROJECTS: "workspaceProjects",
  WORKSPACE_BOARDS: "workspaceBoards",
  WORKSPACE_FILES: "workspaceFiles",
  WORKSPACE_REPORTS: "workspaceReports",

  // 👥 Team-Level Modules
  TEAM_PROFILE: "teamProfile",
  TEAM_MEMBERS: "teamMembers",
  TEAM_TASKS: "teamTasks",
  TEAM_BOARDS: "teamBoards",
  TEAM_NOTES: "teamNotes",
  TEAM_CALENDAR: "teamCalendar",
  TEAM_FILES: "teamFiles",

  // 📁 Project-Level Modules
  PROJECT_PROFILE: "projectProfile",
  PROJECT_MEMBERS: "projectMembers",
  PROJECT_TASKS: "projectTasks",
  PROJECT_EPICS: "projectEpics",
  PROJECT_SPRINTS: "projectSprints",
  PROJECT_BOARDS: "projectBoards",
  PROJECT_FILES: "projectFiles",
  PROJECT_COMMENTS: "projectComments",
  PROJECT_WIKI: "projectWiki",
  PROJECT_AUTOMATIONS: "projectAutomations",
  PROJECT_REPORTS: "projectReports",
  PROJECT_WORKLOGS: "projectWorklogs",
  PROJECT_RELEASES: "projectReleases",
  PROJECT_INTEGRATIONS: "projectIntegrations",

  // General/Common Modules (used across scopes)
  NOTIFICATIONS: "notifications",
  CALENDAR: "calendar",
  MESSAGES: "messages",
  SETTINGS: "settings",
  ACTIVITY_LOGS: "activityLogs",
};




export const PERMISSIONS = {
  // ──────────────────────────────────────────────
  // ──────────────────────────────────────────────
  // 📊 Dashboard & Settings (Platform Admins only)
  // ──────────────────────────────────────────────

  // Can view global metrics, system health, and high-level stats
  VIEW_DASHBOARD: 'VIEW_DASHBOARD',

  // Can update platform-wide configurations (SMTP, branding, limits, etc.)
  MANAGE_PLATFORM_SETTINGS: 'MANAGE_PLATFORM_SETTINGS',

  // ──────────────────────────────────────────────
  // 👥 Users & Organizations (Super Admins only)
  // ──────────────────────────────────────────────

  // Can manage user accounts globally (create/delete/edit across orgs)
  MANAGE_USER_ACCOUNTS: 'MANAGE_USER_ACCOUNTS',

  // Can suspend a user's access platform-wide
  SUSPEND_USER: 'SUSPEND_USER',

  // Can reactivate suspended users
  REACTIVATE_USER: 'REACTIVATE_USER',

  // Can view and manage all organizations on the platform
  MANAGE_ORGANIZATIONS: 'MANAGE_ORGANIZATIONS',

  // Can suspend an organization (block login, pause billing)
  SUSPEND_ORGANIZATION: 'SUSPEND_ORGANIZATION',

  // Can reactivate suspended organizations
  REACTIVATE_ORGANIZATION: 'REACTIVATE_ORGANIZATION',

  // Can view/edit members within any organization
  MANAGE_ORG_MEMBERS: 'MANAGE_ORG_MEMBERS',

  // Can view and edit all system/global role definitions
  MANAGE_SYSTEM_ROLES: 'MANAGE_SYSTEM_ROLES',

  // ──────────────────────────────────────────────
  // 📁 Data Access (Read-only by default unless impersonating)
  // ──────────────────────────────────────────────

  // View all client records across all organizations
  VIEW_ALL_CLIENTS: 'VIEW_ALL_CLIENTS',

  // View all lead records across the system
  VIEW_ALL_LEADS: 'VIEW_ALL_LEADS',

  // View all projects across organizations
  VIEW_ALL_PROJECTS: 'VIEW_ALL_PROJECTS',

  // View all tasks (without sensitive content unless SUPPORT_ORG_LOGIN is used)
  VIEW_ALL_TASKS: 'VIEW_ALL_TASKS',

  // View all workspace structures across orgs (if applicable)
  VIEW_ALL_WORKSPACES: 'VIEW_ALL_WORKSPACES',

  // View all team structures within any organization
  VIEW_ALL_TEAMS: 'VIEW_ALL_TEAMS',

  // View all users mapped within organizations
  VIEW_ALL_USERS: 'VIEW_ALL_USERS',

  // View all firms or business units (if supported)
  VIEW_ALL_FIRMS: 'VIEW_ALL_FIRMS',

  // ──────────────────────────────────────────────
  // 💰 Billing & Subscription Management
  // ──────────────────────────────────────────────

  // Can create, update, and manage billing plans
  MANAGE_BILLING_PLANS: 'MANAGE_BILLING_PLANS',

  // Can manually expire a billing plan (e.g., ending a trial)
  EXPIRE_BILLING_PLAN: 'EXPIRE_BILLING_PLAN',

  // Can view and manage invoices of all organizations
  MANAGE_INVOICES: 'MANAGE_INVOICES',

  // Can set and edit global tax rules (e.g., GST/VAT)
  MANAGE_TAX_CONFIG: 'MANAGE_TAX_CONFIG',

  // ──────────────────────────────────────────────
  // 📄 Logs, Docs & Reporting
  // ──────────────────────────────────────────────

  // Can view all platform-level audit logs (login, actions, changes)
  VIEW_AUDIT_LOGS: 'VIEW_AUDIT_LOGS',

  // Can view documents uploaded globally (if flagged as public/shared)
  VIEW_PLATFORM_DOCUMENTS: 'VIEW_PLATFORM_DOCUMENTS',

  // Can view usage, growth, activity reports across all orgs
  VIEW_USAGE_REPORTS: 'VIEW_USAGE_REPORTS',

  // ──────────────────────────────────────────────
  // 🔌 Integrations & API
  // ──────────────────────────────────────────────

  // Can view and manage integrations (Slack, Zapier, etc.)
  MANAGE_INTEGRATIONS: 'MANAGE_INTEGRATIONS',

  // Can create and manage platform-wide API clients and keys
  MANAGE_API_CLIENTS: 'MANAGE_API_CLIENTS',

  // ──────────────────────────────────────────────
  // 🛟 Support & Security Tools (Support Staff Access)
  // ──────────────────────────────────────────────

  // 🔒 Can impersonate/login into any organization (logs required)
  // Used by support agents to troubleshoot or configure on behalf of orgs
  SUPPORT_ORG_LOGIN: 'SUPPORT_ORG_LOGIN',

  // Can manage and reply to support tickets across all orgs
  MANAGE_SUPPORT_TICKETS: 'MANAGE_SUPPORT_TICKETS',

  // Can view abuse/spam/fraud reports flagged by users or the system
  VIEW_ABUSE_REPORTS: 'VIEW_ABUSE_REPORTS',

  // Can view org-level security status (2FA, breached accounts, etc.)
  VIEW_ORG_SECURITY_STATUS: 'VIEW_ORG_SECURITY_STATUS',

  // ──────────────────────────────────────────────
  // 📣 Platform Notifications & Alerts
  // ──────────────────────────────────────────────

  // Can send platform-wide announcements or alerts to all users/orgs
  MANAGE_PLATFORM_ANNOUNCEMENTS: 'MANAGE_PLATFORM_ANNOUNCEMENTS',

  // Can view logs of all platform-level notifications sent (email/SMS/push)
  VIEW_NOTIFICATION_LOGS: 'VIEW_NOTIFICATION_LOGS',

  // ──────────────────────────────────────────────
  // ⚖️ Legal & Compliance
  // ──────────────────────────────────────────────

  // Can view compliance logs (terms accepted, policy updates, audits)
  VIEW_COMPLIANCE_LOGS: 'VIEW_COMPLIANCE_LOGS',

  // Can manage legal documents (privacy policy, ToS, DPA)
  MANAGE_LEGAL_POLICIES: 'MANAGE_LEGAL_POLICIES',

  // ──────────────────────────────────────────────
  // Organization-level permissions
  // ──────────────────────────────────────────────
  CREATE_ORGANIZATION: 'CREATE_ORGANIZATION',
  EDIT_ORGANIZATION: 'EDIT_ORGANIZATION',
  DELETE_ORGANIZATION: 'DELETE_ORGANIZATION',
  SUSPEND_ORGANIZATION: 'SUSPEND_ORGANIZATION',
  SEND_INVITATION: 'SEND_INVITATION',
  DELETE_ORG_USER: 'DELETE_ORG_USER',
  UPDATE_ORG_USER: 'UPDATE_ORG_USER',
  VIEW_ORG_USER: 'VIEW_ORG_USER',
  APPROVE_ORG_USER: 'APPROVE_ORG_USER',
  EXPORT_ORG_DATA: 'EXPORT_ORG_DATA',
  VIEW_ORG_ANALYTICS: 'VIEW_ORG_ANALYTICS',
  CREATE_TICKET: 'CREATE_TICKET',

  // ──────────────────────────────────────────────
  // User-level permissions
  // ──────────────────────────────────────────────
  CREATE_USER: 'CREATE_USER',
  DELETE_USER: 'DELETE_USER',
  SUSPEND_USER: 'SUSPEND_USER',
  VIEW_USER_PROFILE: 'VIEW_USER_PROFILE',
  UPDATE_USER_PROFILE: 'UPDATE_USER_PROFILE',
  RESET_USER_PASSWORD: 'RESET_USER_PASSWORD',
  MANAGE_USER_SESSIONS: 'MANAGE_USER_SESSIONS',

  // ──────────────────────────────────────────────
  // Lead-level permissions
  // ──────────────────────────────────────────────
  CREATE_LEAD: 'CREATE_LEAD',
  EDIT_LEAD: 'EDIT_LEAD',
  DELETE_LEAD: 'DELETE_LEAD',
  RESTORE_LEAD: 'RESTORE_LEAD',
  CONVERT_LEAD: 'CONVERT_LEAD',
  ASSIGN_LEAD: 'ASSIGN_LEAD',
  VIEW_LEAD: 'VIEW_LEAD',

  // ──────────────────────────────────────────────
  // Client-level permissions
  // ──────────────────────────────────────────────
  CREATE_CLIENT: 'CREATE_CLIENT',
  EDIT_CLIENT: 'EDIT_CLIENT',
  DELETE_CLIENT: 'DELETE_CLIENT',
  RESTORE_CLIENT: 'RESTORE_CLIENT',

  // ──────────────────────────────────────────────
  // Firm-level permissions
  // ──────────────────────────────────────────────
  CREATE_FIRM: 'CREATE_FIRM',
  EDIT_FIRM: 'EDIT_FIRM',
  DELETE_FIRM: 'DELETE_FIRM',
  SUSPEND_FIRM: 'SUSPEND_FIRM',
  RESTORE_FIRM: 'RESTORE_FIRM',
  VIEW_TRASH: 'VIEW_TRASH',
  MERGE_FIRMS: 'MERGE_FIRMS',

  // ──────────────────────────────────────────────
  // Project-level permissions
  // ──────────────────────────────────────────────
  CREATE_PROJECT: 'CREATE_PROJECT',
  EDIT_PROJECT: 'EDIT_PROJECT',
  DELETE_PROJECT: 'DELETE_PROJECT',
  ARCHIVE_PROJECT: 'ARCHIVE_PROJECT',
  ASSIGN_PROJECT_LEAD: 'ASSIGN_PROJECT_LEAD',
  VIEW_PROJECT_ACTIVITY: 'VIEW_PROJECT_ACTIVITY',
  MANAGE_PROJECT_BUDGET: 'MANAGE_PROJECT_BUDGET',
  CREATE_WORKFLOW: 'CREATE_WORKFLOW',
  EDIT_WORKFLOW: 'EDIT_WORKFLOW',
  DELETE_WORKFLOW: 'DELETE_WORKFLOW',
  MANAGE_WORKFLOW_TRANSITIONS: 'MANAGE_WORKFLOW_TRANSITIONS',
  CREATE_BOARD: 'CREATE_BOARD',
  EDIT_BOARD: 'EDIT_BOARD',
  DELETE_BOARD: 'DELETE_BOARD',
  MANAGE_BOARD_COLUMNS: 'MANAGE_BOARD_COLUMNS',
  MOVE_TASKS_BETWEEN_COLUMNS: 'MOVE_TASKS_BETWEEN_COLUMNS',
  VIEW_WORKFLOW: 'VIEW_WORKFLOW',
  VIEW_BOARD: 'VIEW_BOARD',

  // ──────────────────────────────────────────────
  // Task-level permissions
  // ──────────────────────────────────────────────
  CREATE_TASK: 'CREATE_TASK',
  EDIT_TASK: 'EDIT_TASK',
  DELETE_TASK: 'DELETE_TASK',
  ASSIGN_TASK: 'ASSIGN_TASK',
  COMMENT_ON_TASK: 'COMMENT_ON_TASK',
  CHANGE_TASK_STATUS: 'CHANGE_TASK_STATUS',
  MARK_TASK_COMPLETE: 'MARK_TASK_COMPLETE',
  SET_TASK_PRIORITY: 'SET_TASK_PRIORITY',
  VIEW_TASK_HISTORY: 'VIEW_TASK_HISTORY',

  // ──────────────────────────────────────────────
  // Team-level permissions
  // ──────────────────────────────────────────────
  CREATE_TEAM: 'CREATE_TEAM',
  EDIT_TEAM: 'EDIT_TEAM',
  DELETE_TEAM: 'DELETE_TEAM',
  ADD_TEAM_MEMBER: 'ADD_TEAM_MEMBER',
  REMOVE_TEAM_MEMBER: 'REMOVE_TEAM_MEMBER',
  ASSIGN_TEAM_ROLE: 'ASSIGN_TEAM_ROLE',
  MANAGE_TEAM_SETTINGS: 'MANAGE_TEAM_SETTINGS',
  MANAGE_TEAM_PERMISSIONS: 'MANAGE_TEAM_PERMISSIONS',

  // ──────────────────────────────────────────────
  // Role-level permissions
  // ──────────────────────────────────────────────
  CREATE_ROLE: 'CREATE_ROLE',
  EDIT_ROLE: 'EDIT_ROLE',
  DELETE_ROLE: 'DELETE_ROLE',
  ASSIGN_ROLE: 'ASSIGN_ROLE',
  VIEW_ROLE: 'VIEW_ROLE',
  MANAGE_PERMISSIONS: 'MANAGE_PERMISSIONS',
  AUDIT_PERMISSIONS: 'AUDIT_PERMISSIONS',
  CHANGE_MEMBER_ROLE: 'CHANGE_MEMBER_ROLE',

  // ──────────────────────────────────────────────
  // Audit-log permissions
  // ──────────────────────────────────────────────
  VIEW_AUDIT_LOGS: 'VIEW_AUDIT_LOGS',
  EXPORT_AUDIT_LOGS: 'EXPORT_AUDIT_LOGS',

  // ──────────────────────────────────────────────
  // Document permissions
  // ──────────────────────────────────────────────
  UPLOAD_DOCUMENT: 'UPLOAD_DOCUMENT',
  DOWNLOAD_DOCUMENT: 'DOWNLOAD_DOCUMENT',
  SHARE_DOCUMENT: 'SHARE_DOCUMENT',
  MANAGE_DOCUMENT_VERSIONS: 'MANAGE_DOCUMENT_VERSIONS',
  DELETE_DOCUMENT: 'DELETE_DOCUMENT',

  // ──────────────────────────────────────────────
  // Integration permissions
  // ──────────────────────────────────────────────
  INTEGRATE_THIRD_PARTY_APPS: 'INTEGRATE_THIRD_PARTY_APPS',
  MANAGE_INTEGRATIONS: 'MANAGE_INTEGRATIONS',
  MANAGE_WEBHOOKS: 'MANAGE_WEBHOOKS',

  // ──────────────────────────────────────────────
  // Reporting permissions
  // ──────────────────────────────────────────────
  GENERATE_REPORT: 'GENERATE_REPORT',
  EXPORT_DATA: 'EXPORT_DATA',
  SCHEDULE_REPORTS: 'SCHEDULE_REPORTS',
  SHARE_REPORTS: 'SHARE_REPORTS',

  // ──────────────────────────────────────────────
  // View-mode permissions
  // ──────────────────────────────────────────────
  VIEW_ONLY: 'VIEW_ONLY',
  VIEW_LIMITED_ACCESS: 'VIEW_LIMITED_ACCESS',
  VIEW_SELF_DATA_ONLY: 'VIEW_SELF_DATA_ONLY',

  // ──────────────────────────────────────────────
  // Member permissions
  // ──────────────────────────────────────────────
  ADD_MEMBER: 'ADD_MEMBER',
  REMOVE_MEMBER: 'REMOVE_MEMBER',
  ASSIGN_MEMBER_TO_PROJECT: 'ASSIGN_MEMBER_TO_PROJECT',
  INVITE_GUEST: 'INVITE_GUEST',
  VIEW_MEMBER_LIST: 'VIEW_MEMBER_LIST',
}

export const ROLE_SCOPE = {
  // 🔒 System-wide roles (e.g., SuperAdmin, Platform Support)
  PLATFORM: "sc-plat",          // Applies to platform-level operations

  // 🏢 Organization-level roles (e.g., OrgAdmin, Manager)
  ORGANIZATION: "sc-org",       // Applies to a specific organization (firm)

  // 🧩 Workspace-level roles (if using workspaces inside orgs)
  WORKSPACE: "sc-wrk",          // Applies to a specific workspace

  // 📁 Project-level roles (e.g., for project settings, boards, tasks)
  PROJECT: "sc-prj",            // Applies to a specific project

  // 👥 Team-level roles (e.g., for task collaboration and boards)
  TEAM: "sc-tm",                // Applies to a specific team
};

export const ROLE_SCOPES_MAP = {
  // Organization level
  [ROLES.SUPER_ADMIN]: ROLE_SCOPE.ORGANIZATION,
  [ROLES.ORG_ADMIN]: ROLE_SCOPE.ORGANIZATION,
  [ROLES.MANAGER]: ROLE_SCOPE.ORGANIZATION,
  [ROLES.SUPPORT_AGENT]: ROLE_SCOPE.ORGANIZATION,
  [ROLES.USER]: ROLE_SCOPE.ORGANIZATION,
  [ROLES.ORG_CUSTOM]: ROLE_SCOPE.ORGANIZATION,

  // Workspace level
  [ROLES.WORKSPACE_ADMIN]: ROLE_SCOPE.WORKSPACE,
  [ROLES.WORKSPACE_MEMBER]: ROLE_SCOPE.WORKSPACE,
  [ROLES.WORKSPACE_VIEWER]: ROLE_SCOPE.WORKSPACE,
  [ROLES.WORKSPACE_CUSTOM]: ROLE_SCOPE.WORKSPACE,

  // Team level
  [ROLES.TEAM_ADMIN]: ROLE_SCOPE.TEAM,
  [ROLES.TEAM_MEMBER]: ROLE_SCOPE.TEAM,
  [ROLES.TEAM_VIEWER]: ROLE_SCOPE.TEAM,
  [ROLES.TEAM_CUSTOM]: ROLE_SCOPE.TEAM,

  // Project level
  [ROLES.PROJECT_ADMIN]: ROLE_SCOPE.PROJECT,
  [ROLES.PROJECT_MEMBER]: ROLE_SCOPE.PROJECT,
  [ROLES.PROJECT_VIEWER]: ROLE_SCOPE.PROJECT,
  [ROLES.PROJECT_CUSTOM]: ROLE_SCOPE.PROJECT,
};

// console.log(ROLE_SCOPES_MAP);