// // config/rolepermission.js
// import { ROLES, PERMISSIONS, MODULES, } from "../enums/role.enums.js";
// // logger.info("ALL_PERMISSIONS", ALL_PERMISSIONS);

// export const rolepermission = {
//   [ROLES.SUPER_ADMIN]: [
//     {
//       module: MODULES.USER,
//       actions: [
//         PERMISSIONS.CREATE_USER,
//         PERMISSIONS.VIEW_USER,
//         PERMISSIONS.VIEW_ALL_USERS,
//         PERMISSIONS.EDIT_USER,
//         PERMISSIONS.DELETE_USER,
//         PERMISSIONS.SUSPEND_USER,
//         PERMISSIONS.MANAGE_PERMISSIONS,
//       ],
//     },
//     {
//       module: MODULES.ORGANIZATION,
//       actions: [
//         PERMISSIONS.CREATE_ORGANIZATION,
//         PERMISSIONS.VIEW_ORGANIZATION,
//         PERMISSIONS.EDIT_ORGANIZATION,
//         PERMISSIONS.DELETE_ORGANIZATION,
//         PERMISSIONS.SUSPEND_ORGANIZATION,
//         PERMISSIONS.SEND_INVITATION,
//         PERMISSIONS.DELETE_ORG_USER,
//         PERMISSIONS.VIEW_ORG_USER,
//         PERMISSIONS.UPDATE_ORG_USER,
//         PERMISSIONS.APPROVE_ORG_USER,
//       ],
//     },
//     {
//       module: MODULES.FIRM,
//       actions: [
//         PERMISSIONS.CREATE_FIRM,
//         PERMISSIONS.VIEW_ONLY,
//         PERMISSIONS.EDIT_FIRM,
//         PERMISSIONS.DELETE_FIRM,
//         PERMISSIONS.EXPORT_FIRM,

//         PERMISSIONS.RESTORE_FIRM,
//         PERMISSIONS.VIEW_TRASH,
//       ],
//     },
//     {
//       module: MODULES.CLIENT,
//       actions: [
//         PERMISSIONS.CREATE_CLIENT,
//         PERMISSIONS.VIEW_ONLY,
//         PERMISSIONS.EDIT_CLIENT,
//         PERMISSIONS.DELETE_CLIENT,
//         PERMISSIONS.RESTORE_CLIENT,
//         PERMISSIONS.VIEW_TRASH,
//       ],
//     },
//     {
//       module: MODULES.INVOICE,
//       actions: [
//         PERMISSIONS.CREATE_INVOICE,
//         PERMISSIONS.VIEW_ONLY,
//         PERMISSIONS.EDIT_INVOICE,
//         PERMISSIONS.DELETE_INVOICE,
//         PERMISSIONS.EXPORT_INVOICE,
//         PERMISSIONS.RESTORE_INVOICE,
//         PERMISSIONS.VIEW_TRASH,
//       ],
//     },
//     {
//       module: MODULES.LEAD,
//       actions: [
//         PERMISSIONS.CREATE_LEAD,
//         PERMISSIONS.VIEW_ONLY,
//         PERMISSIONS.EDIT_LEAD,
//         PERMISSIONS.DELETE_LEAD,
//         PERMISSIONS.ASSIGN_LEAD,
//         PERMISSIONS.RESTORE_LEAD,
//         PERMISSIONS.VIEW_TRASH,
//       ],
//     },
//     {
//       module: MODULES.TAX,
//       actions: [
//         PERMISSIONS.CREATE_TAX,
//         PERMISSIONS.VIEW_ONLY,
//         PERMISSIONS.EDIT_TAX,
//         PERMISSIONS.DELETE_TAX,
//       ],
//     },
//     {
//       module: MODULES.PROJECT,
//       actions: [
//         PERMISSIONS.CREATE_WORKSPACE,
//         PERMISSIONS.VIEW_ONLY,
//         PERMISSIONS.EDIT_WORKSPACE,
//         PERMISSIONS.DELETE_WORKSPACE,
//         PERMISSIONS.MANAGE_WORKSPACE_SETTINGS,
//         PERMISSIONS.TRANSFER_OWNERSHIP,
//         PERMISSIONS.ARCHIVE_WORKSPACE,
//         PERMISSIONS.VIEW_WORKSPACE_ANALYTICS,

//         PERMISSIONS.ADD_MEMBER,
//         PERMISSIONS.REMOVE_MEMBER,
//         PERMISSIONS.CHANGE_MEMBER_ROLE,
//         PERMISSIONS.ASSIGN_MEMBER_TO_PROJECT,
//         PERMISSIONS.INVITE_GUEST,
//         PERMISSIONS.VIEW_MEMBER_LIST,

//         PERMISSIONS.CREATE_PROJECT,
//         PERMISSIONS.EDIT_PROJECT,
//         PERMISSIONS.DELETE_PROJECT,
//         PERMISSIONS.ASSIGN_PROJECT_LEAD,
//         PERMISSIONS.ARCHIVE_PROJECT,
//         PERMISSIONS.VIEW_PROJECT_ACTIVITY,

//         PERMISSIONS.CREATE_TASK,
//         PERMISSIONS.EDIT_TASK,
//         PERMISSIONS.DELETE_TASK,
//         PERMISSIONS.ASSIGN_TASK,
//         PERMISSIONS.MARK_TASK_COMPLETE,
//         PERMISSIONS.COMMENT_ON_TASK,
//         PERMISSIONS.VIEW_TASK_HISTORY,

//         PERMISSIONS.EXPORT_DATA,
//         PERMISSIONS.GENERATE_REPORT,
//         PERMISSIONS.INTEGRATE_THIRD_PARTY_APPS,
//       ],
//     },
//     {

//       module: MODULES.PERMISSIONS,
//       actions: [
//         PERMISSIONS.CHANGE_MEMBER_ROLE,
//         PERMISSIONS.MANAGE_PERMISSIONS,
//         PERMISSIONS.CREATE_ROLE, PERMISSIONS.VIEW_ONLY,

//         PERMISSIONS.VIEW_ROLE,
//         PERMISSIONS.EDIT_ROLE,
//         PERMISSIONS.DELETE_ROLE
//       ]
//     }
//   ],

//   [ROLES.ORG_ADMIN]: [
//     {
//       module: MODULES.USER,
//       actions: [
//         PERMISSIONS.CREATE_USER,
//         PERMISSIONS.VIEW_ONLY,
//         PERMISSIONS.EDIT_USER,
//         PERMISSIONS.DELETE_USER,
//       ],
//     },
//     {
//       module: MODULES.ORGANIZATION,
//       actions: [
//         PERMISSIONS.CREATE_ORGANIZATION,
//         PERMISSIONS.VIEW_ONLY,
//         PERMISSIONS.EDIT_ORGANIZATION,
//         PERMISSIONS.DELETE_ORGANIZATION,
//         PERMISSIONS.SEND_INVITATION,
//         PERMISSIONS.DELETE_ORG_USER,
//         PERMISSIONS.VIEW_ORG_USER,
//         PERMISSIONS.UPDATE_ORG_USER,
//       ],
//     },
//     {

//       module: MODULES.PERMISSIONS,
//       actions: [
//         PERMISSIONS.CHANGE_MEMBER_ROLE,
//         PERMISSIONS.MANAGE_PERMISSIONS,
//         PERMISSIONS.CREATE_ROLE,
//         PERMISSIONS.VIEW_ONLY,
//         PERMISSIONS.EDIT_ROLE,
//         PERMISSIONS.DELETE_ROLE
//       ]
//     },
//     {
//       module: MODULES.FIRM,
//       actions: [
//         PERMISSIONS.CREATE_FIRM,
//         PERMISSIONS.VIEW_ONLY,
//         PERMISSIONS.EDIT_FIRM,
//         PERMISSIONS.DELETE_FIRM,
//         PERMISSIONS.EXPORT_FIRM,

//         PERMISSIONS.RESTORE_FIRM,
//         PERMISSIONS.VIEW_TRASH,
//       ],
//     },
//     {
//       module: MODULES.CLIENT,
//       actions: [
//         PERMISSIONS.CREATE_CLIENT,
//         PERMISSIONS.VIEW_ONLY,
//         PERMISSIONS.EDIT_CLIENT,
//         PERMISSIONS.DELETE_CLIENT,
//         PERMISSIONS.RESTORE_CLIENT,
//         PERMISSIONS.VIEW_TRASH,
//       ],
//     },
//     {
//       module: MODULES.INVOICE,
//       actions: [
//         PERMISSIONS.CREATE_INVOICE,
//         PERMISSIONS.VIEW_ONLY,
//         PERMISSIONS.EDIT_INVOICE,
//         PERMISSIONS.DELETE_INVOICE,
//         PERMISSIONS.EXPORT_INVOICE,
//         PERMISSIONS.RESTORE_INVOICE,
//         PERMISSIONS.VIEW_TRASH,
//       ],
//     },
//     {
//       module: MODULES.LEAD,
//       actions: [
//         PERMISSIONS.CREATE_LEAD,
//         PERMISSIONS.VIEW_ONLY,
//         PERMISSIONS.EDIT_LEAD,
//         PERMISSIONS.DELETE_LEAD,
//         PERMISSIONS.ASSIGN_LEAD,
//         PERMISSIONS.RESTORE_LEAD,
//         PERMISSIONS.VIEW_TRASH,
//       ],
//     },
//     {
//       module: MODULES.TAX,
//       actions: [
//         PERMISSIONS.CREATE_TAX,
//         PERMISSIONS.VIEW_ONLY,
//         PERMISSIONS.EDIT_TAX,
//         PERMISSIONS.DELETE_TAX,
//       ],
//     },
//     {
//       module: MODULES.PROJECT,
//       actions: [
//         PERMISSIONS.CREATE_WORKSPACE,
//         PERMISSIONS.EDIT_WORKSPACE,
//         PERMISSIONS.DELETE_WORKSPACE,
//         PERMISSIONS.MANAGE_WORKSPACE_SETTINGS,
//         PERMISSIONS.TRANSFER_OWNERSHIP,
//         PERMISSIONS.ARCHIVE_WORKSPACE,
//         PERMISSIONS.VIEW_WORKSPACE_ANALYTICS,

//         PERMISSIONS.ADD_MEMBER,
//         PERMISSIONS.REMOVE_MEMBER,
//         PERMISSIONS.CHANGE_MEMBER_ROLE,
//         PERMISSIONS.ASSIGN_MEMBER_TO_PROJECT,
//         PERMISSIONS.INVITE_GUEST,
//         PERMISSIONS.VIEW_MEMBER_LIST,

//         PERMISSIONS.CREATE_PROJECT,
//         PERMISSIONS.EDIT_PROJECT,
//         PERMISSIONS.DELETE_PROJECT,
//         PERMISSIONS.ASSIGN_PROJECT_LEAD,
//         PERMISSIONS.ARCHIVE_PROJECT,
//         PERMISSIONS.VIEW_PROJECT_ACTIVITY,

//         PERMISSIONS.CREATE_TASK,
//         PERMISSIONS.EDIT_TASK,
//         PERMISSIONS.DELETE_TASK,
//         PERMISSIONS.ASSIGN_TASK,
//         PERMISSIONS.MARK_TASK_COMPLETE,
//         PERMISSIONS.COMMENT_ON_TASK,
//         PERMISSIONS.VIEW_TASK_HISTORY,

//         PERMISSIONS.EXPORT_DATA,
//         PERMISSIONS.GENERATE_REPORT,
//         PERMISSIONS.INTEGRATE_THIRD_PARTY_APPS,
//       ],
//     },
//   ],

//   [ROLES.MANAGER]: [
//     {
//       module: MODULES.USER,
//       actions: [PERMISSIONS.VIEW_USER, PERMISSIONS.EDIT_USER],
//     },
//     {
//       module: MODULES.ORGANIZATION,
//       actions: [PERMISSIONS.VIEW_ONLY, PERMISSIONS.SEND_INVITATION],
//     },
//     {
//       module: MODULES.FIRM,
//       actions: [
//         PERMISSIONS.VIEW_ONLY,
//         PERMISSIONS.EDIT_FIRM,
//         PERMISSIONS.CREATE_FIRM,
//         PERMISSIONS.VIEW_TRASH,
//         PERMISSIONS.RESTORE_FIRM,
//       ],
//     },
//     {
//       module: MODULES.CLIENT,
//       actions: [
//         PERMISSIONS.CREATE_CLIENT,
//         PERMISSIONS.VIEW_ONLY,
//         PERMISSIONS.EDIT_CLIENT,
//         PERMISSIONS.RESTORE_CLIENT,
//         PERMISSIONS.VIEW_TRASH,
//       ],
//     },
//     {
//       module: MODULES.INVOICE,
//       actions: [
//         PERMISSIONS.CREATE_INVOICE,
//         PERMISSIONS.VIEW_ONLY,
//         PERMISSIONS.EDIT_INVOICE,
//         PERMISSIONS.RESTORE_INVOICE,
//         PERMISSIONS.VIEW_TRASH,
//       ],
//     },
//     {
//       module: MODULES.LEAD,
//       actions: [
//         PERMISSIONS.CREATE_LEAD,
//         PERMISSIONS.VIEW_ONLY,
//         PERMISSIONS.EDIT_LEAD,
//         PERMISSIONS.ASSIGN_LEAD,
//         PERMISSIONS.RESTORE_LEAD,
//         PERMISSIONS.VIEW_TRASH,
//       ],
//     },
//     {
//       module: MODULES.TAX,
//       actions: [PERMISSIONS.VIEW_TAX],
//     },
//   ],

//   [ROLES.SUPPORT_AGENT]: [
//     {
//       module: MODULES.USER,
//       actions: [PERMISSIONS.VIEW_USER],
//     },
//     {
//       module: MODULES.FIRM,
//       actions: [PERMISSIONS.VIEW_ONLY],
//     },
//     {
//       module: MODULES.CLIENT,
//       actions: [PERMISSIONS.VIEW_ONLY],
//     },
//     {
//       module: MODULES.INVOICE,
//       actions: [PERMISSIONS.VIEW_ONLY],
//     },
//     {
//       module: MODULES.LEAD,
//       actions: [PERMISSIONS.VIEW_ONLY],
//     },
//   ],

//   [ROLES.USER]: [
//     {
//       module: MODULES.ORGANIZATION,
//       actions: [PERMISSIONS.VIEW_ORGANIZATION],
//     },
//     {
//       module: MODULES.CLIENT,
//       actions: [
//         PERMISSIONS.VIEW_ONLY,
//         // PERMISSIONS.EDIT_CLIENT,
//       ],
//     },
//     {
//       module: MODULES.INVOICE,
//       actions: [PERMISSIONS.VIEW_ONLY],
//     },
//     {
//       module: MODULES.LEAD,
//       actions: [PERMISSIONS.VIEW_ONLY],
//     },
//   ],


//   [ROLES.WORKSPACE_ADMIN]: [
//     {
//       module: MODULES.PROJECT,
//       actions: [
//         PERMISSIONS.EDIT_WORKSPACE,
//         PERMISSIONS.MANAGE_WORKSPACE_SETTINGS,
//         PERMISSIONS.VIEW_WORKSPACE_ANALYTICS,

//         PERMISSIONS.ADD_MEMBER,
//         PERMISSIONS.REMOVE_MEMBER,
//         PERMISSIONS.VIEW_MEMBER_LIST,

//         PERMISSIONS.CREATE_PROJECT,
//         PERMISSIONS.EDIT_PROJECT,
//         PERMISSIONS.ARCHIVE_PROJECT,
//         PERMISSIONS.VIEW_PROJECT_ACTIVITY,
//       ],
//     },
//   ],

//   [ROLES.WORKSPACE_MEMBER]: [
//     {
//       module: MODULES.PROJECT,
//       actions: [
//         PERMISSIONS.VIEW_WORKSPACE_ANALYTICS,
//         PERMISSIONS.VIEW_PROJECT_ACTIVITY,
//         PERMISSIONS.VIEW_TASK_HISTORY,
//         PERMISSIONS.VIEW_ONLY,
//       ],
//     },
//   ],


 

//   [ROLES.PROJECT_ADMIN]: [
//     {
//       module: MODULES.PROJECT,
//       actions: [
//         PERMISSIONS.CREATE_PROJECT,
//         PERMISSIONS.EDIT_PROJECT,
//         PERMISSIONS.ARCHIVE_PROJECT,
//         PERMISSIONS.VIEW_PROJECT_ACTIVITY,

//         PERMISSIONS.ADD_MEMBER,
//         PERMISSIONS.REMOVE_MEMBER,
//         PERMISSIONS.VIEW_MEMBER_LIST,

//         PERMISSIONS.CREATE_TASK,
//         PERMISSIONS.EDIT_TASK,
//         PERMISSIONS.DELETE_TASK,
//         PERMISSIONS.ASSIGN_TASK,
//         PERMISSIONS.MARK_TASK_COMPLETE,
//         PERMISSIONS.COMMENT_ON_TASK,
//         PERMISSIONS.VIEW_TASK_HISTORY,
//       ],
//     },
//   ],

//   [ROLES.PROJECT_MEMBER]: [
//     {
//       module: MODULES.PROJECT,
//       actions: [
//         PERMISSIONS.CREATE_TASK,
//         PERMISSIONS.EDIT_TASK,
//         PERMISSIONS.MARK_TASK_COMPLETE,
//         PERMISSIONS.COMMENT_ON_TASK,
//         PERMISSIONS.VIEW_TASK_HISTORY,
//         PERMISSIONS.VIEW_PROJECT_ACTIVITY,
//       ],
//     },
//   ],

//   [ROLES.PROJECT_VIEWER]: [
// //     {
// //       module: MODULES.PROJECT,
// //       actions: [
// //         PERMISSIONS.VIEW_ONLY,
// //         PERMISSIONS.VIEW_PROJECT_ACTIVITY,
// //         PERMISSIONS.VIEW_TASK_HISTORY,
// //       ],
// //     },
// //   ],
// // };
// export const HRM_PERMISSIONS = {
//   /* Employee */
//   CREATE_EMPLOYEE: "CREATE_EMPLOYEE",
//   VIEW_EMPLOYEE: "VIEW_EMPLOYEE",
//   EDIT_EMPLOYEE: "EDIT_EMPLOYEE",
//   TERMINATE_EMPLOYEE: "TERMINATE_EMPLOYEE",

//   /* Onboarding */
//   START_ONBOARDING: "START_ONBOARDING",
//   REVIEW_ONBOARDING: "REVIEW_ONBOARDING",
//   COMPLETE_ONBOARDING: "COMPLETE_ONBOARDING",

//   /* Attendance */
//   VIEW_ATTENDANCE: "VIEW_ATTENDANCE",
//   MARK_ATTENDANCE_MANUAL: "MARK_ATTENDANCE_MANUAL",
//   REGULARIZE_ATTENDANCE: "REGULARIZE_ATTENDANCE",
//   LOCK_ATTENDANCE: "LOCK_ATTENDANCE",
//   UNLOCK_ATTENDANCE: "UNLOCK_ATTENDANCE",

//   /* Shift */
//   CREATE_SHIFT: "CREATE_SHIFT",
//   EDIT_SHIFT: "EDIT_SHIFT",
//   ASSIGN_SHIFT: "ASSIGN_SHIFT",

//   /* Leave */
//   CREATE_LEAVE_TYPE: "CREATE_LEAVE_TYPE",
//   VIEW_LEAVE: "VIEW_LEAVE",
//   APPROVE_LEAVE: "APPROVE_LEAVE",

//   /* Holiday */
//   CREATE_HOLIDAY: "CREATE_HOLIDAY",
//   VIEW_HOLIDAY: "VIEW_HOLIDAY",

//   /* Payroll */
//   CREATE_SALARY_STRUCTURE: "CREATE_SALARY_STRUCTURE",
//   RUN_PAYROLL: "RUN_PAYROLL",
//   LOCK_PAYROLL: "LOCK_PAYROLL",
//   VIEW_PAYROLL: "VIEW_PAYROLL",

//   /* Policy */
//   CREATE_POLICY: "CREATE_POLICY",
//   EDIT_POLICY: "EDIT_POLICY",
//   VIEW_POLICY: "VIEW_POLICY",

//   /* Reports */
//   VIEW_REPORTS: "VIEW_REPORTS",
//   EXPORT_REPORTS: "EXPORT_REPORTS",

//   /* Settings */
//   MANAGE_HRM_SETTINGS: "MANAGE_HRM_SETTINGS"
// };


import { ROLES, PERMISSIONS, MODULES } from "../enums/role.enums.js";

export const rolePermissions = {
  // 🔒 PLATFORM SUPER ADMIN: Everything
[ROLES.SUPER_ADMIN]: [
  // Platform Settings
  {
    module: MODULES.PLATFORM_SETTINGS,
    actions: [
      PERMISSIONS.MANAGE_SETTINGS,
      PERMISSIONS.VIEW_DASHBOARD
    ],
  },
  // Platform Users & Organizations
  {
    module: MODULES.PLATFORM_USERS,
    actions: [
      PERMISSIONS.MANAGE_USER_LIST,
      PERMISSIONS.MANAGE_ORGANIZATION_LIST,
      PERMISSIONS.CREATE_USER,
      PERMISSIONS.DELETE_USER,
     
    ],
  },
  // Platform Billing
  {
    module: MODULES.PLATFORM_BILLING,
    actions: [
      PERMISSIONS.MANAGE_BILLING_PLAN_LIST,
      PERMISSIONS.MANAGE_INVOICE_LIST,
      PERMISSIONS.MANAGE_TAX_LIST
    ],
  },
  // Platform Audit & Monitoring
  {
    module: MODULES.PLATFORM_AUDIT_LOGS,
    actions: [
      PERMISSIONS.VIEW_AUDIT_LOGS,
      PERMISSIONS.EXPORT_AUDIT_LOGS
    ],
  },
  // Platform Analytics
  {
    module: MODULES.PLATFORM_ANALYTICS,
    actions: [
      PERMISSIONS.GENERATE_REPORT,
      PERMISSIONS.EXPORT_DATA
    ],
  }
],

  // 🔒 PLATFORM ADMIN: All platform-level permissions
  [ROLES.PLATFORM_ADMIN]: [
    {
      module: [
        MODULES.PLATFORM_SETTINGS,
        MODULES.PLATFORM_BILLING,
        MODULES.PLATFORM_SUPPORT,
        MODULES.PLATFORM_ANALYTICS,
        MODULES.PLATFORM_USERS,
      ],
      actions: Object.values(PERMISSIONS),
    },
  ],

  // 🏢 ORG OWNER & ADMIN: Full access to all ORG-level modules
  [ROLES.ORG_OWNER]: [
    {
      module: [
        MODULES.ORG_PROFILE,
        MODULES.ORG_BILLING,
        MODULES.ORG_INVOICES,
        MODULES.ORG_TAX,
        MODULES.ORG_CLIENTS,
        MODULES.ORG_LEADS,
        MODULES.ORG_SUPPORT,
        MODULES.ORG_TASKS,
        MODULES.ORG_DOCUMENTS,
        MODULES.ORG_MEMBERS,
        MODULES.ORG_ROLES,
        MODULES.ORG_INTEGRATIONS,
        MODULES.ORG_REPORTS,
      ],
      actions: Object.values(PERMISSIONS),
    },
  ],
  [ROLES.ORG_ADMIN]: [
    {
      module: [
        MODULES.ORG_PROFILE,
        MODULES.ORG_BILLING,
        MODULES.ORG_INVOICES,
        MODULES.ORG_TAX,
        MODULES.ORG_CLIENTS,
        MODULES.ORG_LEADS,
        MODULES.ORG_SUPPORT,
        MODULES.ORG_TASKS,
        MODULES.ORG_DOCUMENTS,
        MODULES.ORG_MEMBERS,
        MODULES.ORG_ROLES,
        MODULES.ORG_INTEGRATIONS,
        MODULES.ORG_REPORTS,
      ],
      actions: Object.values(PERMISSIONS),
    },
  ],

  // 🧭 WORKSPACE ADMIN: Full access to projects & teams
  [ROLES.WORKSPACE_ADMIN]: [
    {
      module: [MODULES.PROJECT_PROFILE, MODULES.TEAM_PROFILE],
      actions: Object.values(PERMISSIONS),
    },
  ],

  // 📁 PROJECT ADMIN: Full access to project
  [ROLES.PROJECT_ADMIN]: [
    {
      module: [MODULES.PROJECT_PROFILE],
      actions: Object.values(PERMISSIONS),
    },
  ],

  // 👥 TEAM ADMIN: Full access to team
  [ROLES.TEAM_ADMIN]: [
    {
      module: [MODULES.TEAM_PROFILE],
      actions: Object.values(PERMISSIONS),
    },
  ],

  // 🧩 MANAGER: Access to leads & tasks
  [ROLES.MANAGER]: [
    {
      module: [MODULES.ORG_LEADS],
      actions: [
        PERMISSIONS.CREATE_LEAD,
        PERMISSIONS.EDIT_LEAD,
        PERMISSIONS.DELETE_LEAD,
        PERMISSIONS.ASSIGN_LEAD,
        PERMISSIONS.VIEW_LEAD,
      ],
    },
    {
      module: [MODULES.ORG_TASKS],
      actions: [
        PERMISSIONS.CREATE_TASK,
        PERMISSIONS.EDIT_TASK,
        PERMISSIONS.DELETE_TASK,
        PERMISSIONS.ASSIGN_TASK,
        PERMISSIONS.MARK_TASK_COMPLETE,
        PERMISSIONS.COMMENT_ON_TASK,
        PERMISSIONS.VIEW_TASK_HISTORY,
      ],
    },
  ],

  // 🛠 SUPPORT AGENT: Support module only
  [ROLES.SUPPORT_AGENT]: [
    {
      module: [MODULES.ORG_SUPPORT],
      actions: [
        PERMISSIONS.VIEW_SUPPORT_TICKETS,
        PERMISSIONS.MANAGE_SUPPORT_TICKETS,
      ],
    },
  ],

  // 💸 FINANCE MANAGER: Invoices
  [ROLES.FINANCE_MANAGER]: [
    {
      module: [MODULES.ORG_INVOICES],
      actions: [
        PERMISSIONS.CREATE_INVOICE,
        PERMISSIONS.EDIT_INVOICE,
        PERMISSIONS.DELETE_INVOICE,
        PERMISSIONS.EXPORT_INVOICE,
        PERMISSIONS.RESTORE_INVOICE,
        PERMISSIONS.VIEW_INVOICE_LIST,
      ],
    },
  ],

  // 📈 SALES MANAGER: Leads & Clients
  [ROLES.SALES_MANAGER]: [
    {
      module: [MODULES.ORG_LEADS],
      actions: [
        PERMISSIONS.CREATE_LEAD,
        PERMISSIONS.EDIT_LEAD,
        PERMISSIONS.DELETE_LEAD,
        PERMISSIONS.ASSIGN_LEAD,
        PERMISSIONS.VIEW_LEAD,
      ],
    },
    {
      module: [MODULES.ORG_CLIENTS],
      actions: [
        PERMISSIONS.CREATE_CLIENT,
        PERMISSIONS.EDIT_CLIENT,
        PERMISSIONS.DELETE_CLIENT,
        PERMISSIONS.RESTORE_CLIENT,
        PERMISSIONS.VIEW_CLIENT_LIST,
      ],
    },
  ],

  // 👤 SALES REP: View & edit leads
  [ROLES.SALES_REP]: [
    {
      module: [MODULES.ORG_LEADS],
      actions: [
        PERMISSIONS.CREATE_LEAD,
        PERMISSIONS.EDIT_LEAD,
        PERMISSIONS.VIEW_LEAD,
      ],
    },
  ],

  
  
};
logger.info("rolePermissions", rolePermissions);