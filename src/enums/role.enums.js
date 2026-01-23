
export const ROLES = {
  // 🌐 Platform-level (SaaS-wide)
  SUPER_ADMIN: "SuperAdmin",            // Full control over platform
  PLATFORM_ADMIN: "PlatformAdmin",      // Manages platform settings & users
  PLATFORM_SUPPORT: "PlatformSupport",  // Troubleshooting, impersonation
  PLATFORM_BILLING: "PlatformBilling",  // Billing & taxation
  PLATFORM_DEVOPS: "PlatformDevOps",    // Infra & monitoring
  PLATFORM_ANALYST: "PlatformAnalyst",  // Global analytics
  PLATFORM_CUSTOM: "PlatformCustom",    // Flexible custom role

  // 🏢 Organization-level (CRM operations)
  ORG_OWNER: "OrgOwner",                // Ultimate control of org
  ORG_ADMIN: "OrgAdmin",                // Manages settings, users, modules
  FINANCE_MANAGER: "FinanceManager",    // Invoices, tax, billing
  SALES_MANAGER: "SalesManager",        // Leads, clients, pipeline
  SUPPORT_AGENT: "SupportAgent",        // Handles support queries
  ORG_ANALYST: "OrgAnalyst",            // Reporting & analytics
  CLIENT_CONTACT: "ClientContact",      // External client role
  ORG_CUSTOM: "OrgCustom",              // Custom org role

  // 🧱 Workspace-level (group of projects/teams)
  WORKSPACE_ADMIN: "WorkspaceAdmin",    // Controls workspace
  WORKSPACE_MEMBER: "WorkspaceMember",  // Contributes to projects
  WORKSPACE_VIEWER: "WorkspaceViewer",  // Read-only
  WORKSPACE_CUSTOM: "WorkspaceCustom",  // Custom workspace role

  // 👥 Team-level (inside workspace/project)
  TEAM_LEAD: "TeamLead",                // Leads & assigns work
  TEAM_MEMBER: "TeamMember",            // Active contributor
  TEAM_VIEWER: "TeamViewer",            // Read-only
  TEAM_CUSTOM: "TeamCustom",            // Custom team role

  // 📁 Project-level (Jira-like project management)
  PROJECT_ADMIN: "ProjectAdmin",        // Controls project setup & workflows
  PROJECT_MEMBER: "ProjectMember",      // Works on tasks
  PROJECT_VIEWER: "ProjectViewer",      // Read-only
  PROJECT_CUSTOM: "ProjectCustom",      // Custom project role

  // 👔 HRM-level (employees & HR ops)
  HR_ADMIN: "HRAdmin",                  // Controls HR module
  HR_MANAGER: "HRManager",              // Manages employees, payroll
  EMPLOYEE: "Employee",                 // Standard staff role
  HR_CUSTOM: "HRCustom" 
                  // Custom HR role
};



export const MODULES = {
  PLATFORM: "platform",                     // Global settings, monitoring, billing ops, infra
  ORGANIZATION: "organization",             // Org-level settings & details
  FIRM: "firm",                             // Business units inside organizations
  CLIENT: "client",                         // Customers, partners
  LEAD: "lead",                             // Sales pipeline
  INVOICE: "invoice",                       // Billing documents
  TAX: "tax",                               // Tax configurations & compliance
  USER: "user",
  DOCUMENT: "document",
  REPORTS: "reports",                       // Org users
  ROLE_PERMISSION: "role_permission",       // Role-based access control
  PROJECT_MANAGEMENT: "project_management", // Projects, tasks, workflows
  HRM_MANAGEMENT: "hrm_management" ,
  EMPLOYEE: "EMPLOYEE",
  ONBOARDING: "ONBOARDING",
  ATTENDANCE: "ATTENDANCE",
  SHIFT: "SHIFT",
  LEAVE: "LEAVE",
  HOLIDAY: "HOLIDAY",
  PAYROLL: "PAYROLL",
  POLICY: "POLICY",
  REPORTS: "REPORTS",
  SETTINGS: "SETTINGS"
};
        // Employees, payroll, HR ops





export const PERMISSIONS = {
  // ───────────────────────────────
  // Platform
  // ───────────────────────────────
  MANAGE_PLATFORM_SETTINGS: 'MANAGE_PLATFORM_SETTINGS',
  MANAGE_SUBSCRIPTIONS: 'MANAGE_SUBSCRIPTIONS',
  MANAGE_SUPPORT_SESSIONS: 'MANAGE_SUPPORT_SESSIONS',
  VIEW_PLATFORM_ANALYTICS: 'VIEW_PLATFORM_ANALYTICS',

  // ───────────────────────────────
  // Organization & Users
  // ───────────────────────────────
  CREATE_ORGANIZATION: 'CREATE_ORGANIZATION',
  EDIT_ORGANIZATION: 'EDIT_ORGANIZATION',
  DELETE_ORGANIZATION: 'DELETE_ORGANIZATION',
  SUSPEND_ORGANIZATION: 'SUSPEND_ORGANIZATION',
  EXPORT_ORG_DATA: 'EXPORT_ORG_DATA',
  VIEW_ORG_ANALYTICS: 'VIEW_ORG_ANALYTICS',
  VIEW_ORG: 'VIEW_ORG',
  VIEW_USER: 'VIEW_USER',
  VIEW_ALL_USERS: 'VIEW_ALL_USERS',
  UPDATE_ORG_USER: 'UPDATE_ORG_USER',
  DELETE_ORG_USER: 'DELETE_ORG_USER',
  SEND_INVITATION: 'SEND_INVITATION',
  MANAGE_ORG_SESSIONS: 'MANAGE_ORG_SESSIONS',
  ENABLE_SUPPORT_SESSIONS: 'ENABLE_SUPPORT_SESSIONS',
  VIEW_ORG_USER: 'VIEW_ORG_USER',


  CREATE_USER: 'CREATE_USER',
  DELETE_USER: 'DELETE_USER',
  SUSPEND_USER: 'SUSPEND_USER',
  // APPROVE_ORG_USER: 'APPROVE_ORG_USER',

  VIEW_USER_PROFILE: 'VIEW_USER_PROFILE',
  // UPDATE_USER_PROFILE: 'UPDATE_USER_PROFILE',
  // RESET_USER_PASSWORD: 'RESET_USER_PASSWORD',
  // MANAGE_USER_SESSIONS: 'MANAGE_USER_SESSIONS',

  // ───────────────────────────────
  // Lead
  // ───────────────────────────────
  CREATE_LEAD: 'CREATE_LEAD',
  EDIT_LEAD: 'EDIT_LEAD',
  DELETE_LEAD: 'DELETE_LEAD',
  VIEW_DELETED_LEAD: 'VIEW_DELETED_LEAD',
  RESTORE_LEAD: 'RESTORE_LEAD',
  // CONVERT_LEAD: 'CONVERT_LEAD',
  ASSIGN_LEAD: 'ASSIGN_LEAD',
  VIEW_LEAD: 'VIEW_LEAD',

  // ───────────────────────────────
  // Client
  // ───────────────────────────────
  CREATE_CLIENT: 'CREATE_CLIENT',
  EDIT_CLIENT: 'EDIT_CLIENT',
  DELETE_CLIENT: 'DELETE_CLIENT',
  RESTORE_CLIENT: 'RESTORE_CLIENT',
  VIEW_CLIENT_LIST: 'VIEW_CLIENT_LIST',
  VIEW_DELETED_CLIENT: 'VIEW_DELETED_CLIENT',
  // ───────────────────────────────
  // Firm
  // ───────────────────────────────
  CREATE_FIRM: 'CREATE_FIRM',
  EDIT_FIRM: 'EDIT_FIRM',
  DELETE_FIRM: 'DELETE_FIRM',
  RESTORE_FIRM: 'RESTORE_FIRM',
  VIEW_DELETED_FIRM: 'VIEW_DELETED_FIRM',
  VIEW_FIRM: 'VIEW_FIRM',

  // ───────────────────────────────
  // Project
  // ───────────────────────────────
  CREATE_PROJECT: 'CREATE_PROJECT',
  EDIT_PROJECT: 'EDIT_PROJECT',
  DELETE_PROJECT: 'DELETE_PROJECT',
  ASSIGN_PROJECT_LEAD: 'ASSIGN_PROJECT_LEAD',
  ADD_PROJECT_MEMBER: 'ADD_PROJECT_MEMBER',
  REMOVE_PROJECT_MEMBER: 'REMOVE_PROJECT_MEMBER',
  VIEW_PROJECT_MEMBERS: 'VIEW_PROJECT_MEMBERS',
  EDIT_PROJECT_MEMBERS: 'EDIT_PROJECT_MEMBERS',
  VIEW_ASSIGN_PROJECT_MEMBERS: 'VIEW_ASSIGN_PROJECT_MEMBERS',
  MAMAGE_PROJECT_PERMISSIONS: 'MAMAGE_PROJECT_PERMISSIONS',
  MANAGE_PROJECT_BUDGET: 'MANAGE_PROJECT_BUDGET',
  VIEW_PROJECT: 'VIEW_PROJECT',
  VIEW_ALL_PROJECT: 'VIEW_ALL_PROJECT',
  VIEW_PROJECT_ANALYTICS: 'VIEW_PROJECT_ANALYTICS',

  CREATE_WORKFLOW: 'CREATE_WORKFLOW',
  EDIT_WORKFLOW: 'EDIT_WORKFLOW',
  DELETE_WORKFLOW: 'DELETE_WORKFLOW',
  MANAGE_WORKFLOW_TRANSITIONS: 'MANAGE_WORKFLOW_TRANSITIONS',
  VIEW_WORKFLOW: 'VIEW_WORKFLOW',

  CREATE_BOARD: 'CREATE_BOARD',
  DELETE_BOARD: 'DELETE_BOARD',
  EDIT_BOARD_COLUMN: 'EDIT_BOARD_COLUMN',
  MANAGE_BOARD_COLUMNS: 'MANAGE_BOARD_COLUMNS',
  DELETE_BOARD_COLUMN: 'DELETE_BOARD_COLUMN',
  VIEW_BOARD: 'VIEW_BOARD',
  VIEW_ALL_BOARD: 'VIEW_ALL_BOARD',

  // ───────────────────────────────
  // Board Automation (Jira-style)
  // ───────────────────────────────
  CREATE_AUTOMATION_RULE: 'CREATE_AUTOMATION_RULE',
  EDIT_AUTOMATION_RULE: 'EDIT_AUTOMATION_RULE',
  DELETE_AUTOMATION_RULE: 'DELETE_AUTOMATION_RULE',
  ENABLE_AUTOMATION_RULE: 'ENABLE_AUTOMATION_RULE',
  DISABLE_AUTOMATION_RULE: 'DISABLE_AUTOMATION_RULE',
  VIEW_AUTOMATION_RULE: 'VIEW_AUTOMATION_RULE',
  MANAGE_AUTOMATION_TRIGGERS: 'MANAGE_AUTOMATION_TRIGGERS',
  MANAGE_AUTOMATION_ACTIONS: 'MANAGE_AUTOMATION_ACTIONS',
  MANAGE_AUTOMATION_CONDITIONS: 'MANAGE_AUTOMATION_CONDITIONS',
  RUN_AUTOMATION_MANUALLY: 'RUN_AUTOMATION_MANUALLY',

  // ───────────────────────────────
  // Task
  // ───────────────────────────────

  CREATE_TASK: 'CREATE_TASK',
  VIEW_ALL_TASKS: 'VIEW_ALL_TASKS',
  EDIT_TASK: 'EDIT_TASK',
  DELETE_TASK: 'DELETE_TASK',
  MOVE_TASKS_BETWEEN_COLUMNS: 'MOVE_TASKS_BETWEEN_COLUMNS',
  COMMENT_ON_TASK: 'COMMENT_ON_TASK',
  VIEW_TASK: 'VIEW_TASK',

  // ───────────────────────────────
  // Team
  // ───────────────────────────────
  CREATE_TEAM: 'CREATE_TEAM',
  VIEW_TEAM: 'VIEW_TEAM',
  EDIT_TEAM: 'EDIT_TEAM',
  DELETE_TEAM: 'DELETE_TEAM',
  VIEW_ASSIGN_TEAM_MEMBERS: 'VIEW_ASSIGN_TEAM_MEMBERS',
  ADD_TEAM_MEMBER: 'ADD_TEAM_MEMBER',
  REMOVE_TEAM_MEMBER: 'REMOVE_TEAM_MEMBER',
  VIEW_TEAM_MEMBERS: 'VIEW_TEAM_MEMBERS',
  ASSIGN_TEAM_ROLE: 'ASSIGN_TEAM_ROLE',
  MANAGE_TEAM_SETTINGS: 'MANAGE_TEAM_SETTINGS',
  MANAGE_TEAM_PERMISSIONS: 'MANAGE_TEAM_PERMISSIONS',
  EDIT_TEAM_MEMBERS: 'EDIT_TEAM_MEMBERS',

  // ───────────────────────────────
  // Role & Permissions
  // ───────────────────────────────
  CREATE_ROLE: 'CREATE_ROLE',
  EDIT_ROLE: 'EDIT_ROLE',
  DELETE_ROLE: 'DELETE_ROLE',
  VIEW_ROLE: 'VIEW_ROLE',
  MANAGE_PERMISSIONS: 'MANAGE_PERMISSIONS',
  AUDIT_PERMISSIONS: 'AUDIT_PERMISSIONS',
  CHANGE_MEMBER_ROLE: 'CHANGE_MEMBER_ROLE',

  // ───────────────────────────────
  // Document
  // ───────────────────────────────
  UPLOAD_DOCUMENT: 'UPLOAD_DOCUMENT',
  DOWNLOAD_DOCUMENT: 'DOWNLOAD_DOCUMENT',
  SHARE_DOCUMENT: 'SHARE_DOCUMENT',
  MANAGE_DOCUMENT_VERSIONS: 'MANAGE_DOCUMENT_VERSIONS',
  DELETE_DOCUMENT: 'DELETE_DOCUMENT',

  // ───────────────────────────────
  // Reporting
  // ───────────────────────────────
  GENERATE_REPORT: 'GENERATE_REPORT',
  EXPORT_DATA: 'EXPORT_DATA',
  SCHEDULE_REPORTS: 'SCHEDULE_REPORTS',
  SHARE_REPORTS: 'SHARE_REPORTS',

  // ───────────────────────────────
  // HRM
  // ───────────────────────────────
  CREATE_EMPLOYEE: 'CREATE_EMPLOYEE',
  EDIT_EMPLOYEE: 'EDIT_EMPLOYEE',
  DELETE_EMPLOYEE: 'DELETE_EMPLOYEE',
  SUSPEND_EMPLOYEE: 'SUSPEND_EMPLOYEE',
  VIEW_EMPLOYEE_PROFILE: 'VIEW_EMPLOYEE_PROFILE',
  VIEW_ALL_EMPLOYEES: 'VIEW_ALL_EMPLOYEES',
  MANAGE_EMPLOYE_LEAVE: 'MANAGE_EMPLOYE_LEAVE',
  MANAGE_EMPLOYEE_PERMISSIONS: 'MANAGE_EMPLOYEE_PERMISSIONS',
  UPDATE_EMPLOYEE_PROFILE: 'UPDATE_EMPLOYEE_PROFILE',

  MANAGE_PAYROLL: 'MANAGE_PAYROLL',
  VIEW_PAYSLIPS: 'VIEW_PAYSLIPS',
  APPROVE_TIMESHEETS: 'APPROVE_TIMESHEETS',
  MANAGE_ATTENDANCE: 'MANAGE_ATTENDANCE',

  CREATE_JOB_POSTING: 'CREATE_JOB_POSTING',
  EDIT_JOB_POSTING: 'EDIT_JOB_POSTING',
  DELETE_JOB_POSTING: 'DELETE_JOB_POSTING',
  REVIEW_APPLICATIONS: 'REVIEW_APPLICATIONS',
  HIRE_CANDIDATE: 'HIRE_CANDIDATE',

  INVITE_GUEST: 'INVITE_GUEST',

  VIEW_ONLY: 'VIEW_ONLY',
  VIEW_LIMITED_ACCESS: 'VIEW_LIMITED_ACCESS',
  //
  VIEW_AUDIT_LOGS: 'VIEW_AUDIT_LOGS',
  MANAGE_AUDIT_LOGS: 'MANAGE_AUDIT_LOGS',
};


export const ROLE_SCOPE = {
  // 🔒 System-wide roles (platform-wide access)
  PLATFORM: "sc-plat",          // Applies to platform-level operations

  // 🏢 Organization-level roles
  ORGANIZATION: "sc-org",       // Applies to a specific organization

  // 🧩 Workspace-level roles
  WORKSPACE: "sc-wrk",          // Applies to a specific workspace

  // 📁 Project-level roles
  PROJECT: "sc-prj",            // Applies to a specific project

  // 👥 Team-level roles
  TEAM: "sc-tm",                // Applies to a specific team

  // 🧑‍💼 HRM-level roles
  HRM: "sc-hrm",                // Applies to HRM (employees, payroll, HR ops)

  // 🎟️ Guest-level roles
  GUEST: "sc-guest",            // Applies to guest/external users
};


export const ROLE_SCOPES_MAP = {
  // 🌐 Platform level
  [ROLES.SUPER_ADMIN]: ROLE_SCOPE.PLATFORM,
  [ROLES.PLATFORM_ADMIN]: ROLE_SCOPE.PLATFORM,
  [ROLES.PLATFORM_SUPPORT]: ROLE_SCOPE.PLATFORM,
  [ROLES.PLATFORM_BILLING]: ROLE_SCOPE.PLATFORM,
  [ROLES.PLATFORM_DEVOPS]: ROLE_SCOPE.PLATFORM,
  [ROLES.PLATFORM_ANALYST]: ROLE_SCOPE.PLATFORM,
  [ROLES.PLATFORM_CUSTOM]: ROLE_SCOPE.PLATFORM,

  // 🏢 Organization level
  [ROLES.ORG_OWNER]: ROLE_SCOPE.ORGANIZATION,
  [ROLES.ORG_ADMIN]: ROLE_SCOPE.ORGANIZATION,
  [ROLES.FINANCE_MANAGER]: ROLE_SCOPE.ORGANIZATION,
  [ROLES.SALES_MANAGER]: ROLE_SCOPE.ORGANIZATION,
  [ROLES.SUPPORT_AGENT]: ROLE_SCOPE.ORGANIZATION,
  [ROLES.ORG_ANALYST]: ROLE_SCOPE.ORGANIZATION,
  [ROLES.CLIENT_CONTACT]: ROLE_SCOPE.ORGANIZATION, // external role still scoped to org
  [ROLES.ORG_CUSTOM]: ROLE_SCOPE.ORGANIZATION,

  // 🧱 Workspace level
  [ROLES.WORKSPACE_ADMIN]: ROLE_SCOPE.WORKSPACE,
  [ROLES.WORKSPACE_MEMBER]: ROLE_SCOPE.WORKSPACE,
  [ROLES.WORKSPACE_VIEWER]: ROLE_SCOPE.WORKSPACE,
  [ROLES.WORKSPACE_CUSTOM]: ROLE_SCOPE.WORKSPACE,

  // 👥 Team level
  [ROLES.TEAM_LEAD]: ROLE_SCOPE.TEAM,
  [ROLES.TEAM_MEMBER]: ROLE_SCOPE.TEAM,
  [ROLES.TEAM_VIEWER]: ROLE_SCOPE.TEAM,
  [ROLES.TEAM_CUSTOM]: ROLE_SCOPE.TEAM,

  // 📁 Project level
  [ROLES.PROJECT_ADMIN]: ROLE_SCOPE.PROJECT,
  [ROLES.PROJECT_MEMBER]: ROLE_SCOPE.PROJECT,
  [ROLES.PROJECT_VIEWER]: ROLE_SCOPE.PROJECT,
  [ROLES.PROJECT_CUSTOM]: ROLE_SCOPE.PROJECT,

  // 👔 HRM level
  [ROLES.HR_ADMIN]: ROLE_SCOPE.HRM,
  [ROLES.HR_MANAGER]: ROLE_SCOPE.HRM,
  [ROLES.EMPLOYEE]: ROLE_SCOPE.HRM,
  [ROLES.HR_CUSTOM]: ROLE_SCOPE.HRM,
};

