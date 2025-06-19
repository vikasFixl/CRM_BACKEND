// config/rolepermission.js
import { ROLES, PERMISSIONS, MODULES } from "../enums/role.enums.js";



export const rolepermission = {
  [ROLES.SUPER_ADMIN]: [
    {
      module: MODULES.USER,
      actions: [
        PERMISSIONS.CREATE_USER,
        PERMISSIONS.VIEW_USER,
        PERMISSIONS.VIEW_ALL_USERS,
        PERMISSIONS.EDIT_USER,
        PERMISSIONS.DELETE_USER,
        PERMISSIONS.SUSPEND_USER,
        PERMISSIONS.MANAGE_PERMISSIONS,
      ],
    },
    {
      module: MODULES.ORGANIZATION,
      actions: [
        PERMISSIONS.CREATE_ORGANIZATION,
        PERMISSIONS.VIEW_ORGANIZATION,
        PERMISSIONS.EDIT_ORGANIZATION,
        PERMISSIONS.DELETE_ORGANIZATION,
        PERMISSIONS.SUSPEND_ORGANIZATION,
        PERMISSIONS.SEND_INVITATION,
        PERMISSIONS.DELETE_ORG_USER,
        PERMISSIONS.VIEW_ORG_USER,
        PERMISSIONS.UPDATE_ORG_USER,
        PERMISSIONS.APPROVE_ORG_USER,
      ],
    },
    {
      module: MODULES.FIRM,
      actions: [
        PERMISSIONS.CREATE_FIRM,
        PERMISSIONS.VIEW_FIRM,
        PERMISSIONS.EDIT_FIRM,
        PERMISSIONS.DELETE_FIRM,
        PERMISSIONS.EXPORT_FIRM,
      
        PERMISSIONS.RESTORE_FIRM,
        PERMISSIONS.VIEW_TRASH,
      ],
    },
    {
      module: MODULES.CLIENT,
      actions: [
        PERMISSIONS.CREATE_CLIENT,
        PERMISSIONS.VIEW_CLIENT,
        PERMISSIONS.EDIT_CLIENT,
        PERMISSIONS.DELETE_CLIENT,
        PERMISSIONS.RESTORE_CLIENT,
        PERMISSIONS.VIEW_TRASH,

      ],
    },
    {
      module: MODULES.INVOICE,
      actions: [
        PERMISSIONS.CREATE_INVOICE,
        PERMISSIONS.VIEW_INVOICE,
        PERMISSIONS.EDIT_INVOICE,
        PERMISSIONS.DELETE_INVOICE,
        PERMISSIONS.EXPORT_INVOICE,
        PERMISSIONS.RESTORE_INVOICE,
        PERMISSIONS.VIEW_TRASH,
      ],
    },
    {
      module: MODULES.LEAD,
      actions: [
        PERMISSIONS.CREATE_LEAD,
        PERMISSIONS.VIEW_LEAD,
        PERMISSIONS.EDIT_LEAD,
        PERMISSIONS.DELETE_LEAD,
        PERMISSIONS.ASSIGN_LEAD,
        PERMISSIONS.RESTORE_LEAD,
        PERMISSIONS.VIEW_TRASH,
      ],
    },
    {
      module: MODULES.TAX,
      actions: [
        PERMISSIONS.CREATE_TAX,
        PERMISSIONS.VIEW_TAX,
        PERMISSIONS.EDIT_TAX,
        PERMISSIONS.DELETE_TAX,
      ],
    },
  ],

  [ROLES.ORG_ADMIN]: [
    {
      module: MODULES.USER,
      actions: [
        PERMISSIONS.CREATE_USER,
        PERMISSIONS.VIEW_USER,
        PERMISSIONS.EDIT_USER,
        PERMISSIONS.DELETE_USER,
      ],
    },
    {
      module: MODULES.ORGANIZATION,
      actions: [
        PERMISSIONS.CREATE_ORGANIZATION,
        PERMISSIONS.VIEW_ORGANIZATION,
        PERMISSIONS.EDIT_ORGANIZATION,
        PERMISSIONS.DELETE_ORGANIZATION,
        PERMISSIONS.SEND_INVITATION,
        PERMISSIONS.DELETE_ORG_USER,
        PERMISSIONS.VIEW_ORG_USER,
        PERMISSIONS.UPDATE_ORG_USER,
      ],
    },
    {
      module: MODULES.FIRM,
      actions: [
        PERMISSIONS.CREATE_FIRM,
        PERMISSIONS.VIEW_FIRM,
        PERMISSIONS.EDIT_FIRM,
        PERMISSIONS.DELETE_FIRM,
        PERMISSIONS.EXPORT_FIRM,
        
        PERMISSIONS.RESTORE_FIRM,
        PERMISSIONS.VIEW_TRASH,
      ],
    },
    {
      module: MODULES.CLIENT,
      actions: [
        PERMISSIONS.CREATE_CLIENT,
        PERMISSIONS.VIEW_CLIENT,
        PERMISSIONS.EDIT_CLIENT,
        PERMISSIONS.DELETE_CLIENT,
         PERMISSIONS.RESTORE_CLIENT,
        PERMISSIONS.VIEW_TRASH,
      ],
    },
    {
      module: MODULES.INVOICE,
      actions: [
        PERMISSIONS.CREATE_INVOICE,
        PERMISSIONS.VIEW_INVOICE,
        PERMISSIONS.EDIT_INVOICE,
        PERMISSIONS.DELETE_INVOICE,
        PERMISSIONS.EXPORT_INVOICE,
        PERMISSIONS.RESTORE_INVOICE,
        PERMISSIONS.VIEW_TRASH
      ],
    },
    {
      module: MODULES.LEAD,
      actions: [
        PERMISSIONS.CREATE_LEAD,
        PERMISSIONS.VIEW_LEAD,
        PERMISSIONS.EDIT_LEAD,
        PERMISSIONS.DELETE_LEAD,
        PERMISSIONS.ASSIGN_LEAD,
          PERMISSIONS.RESTORE_LEAD,
        PERMISSIONS.VIEW_TRASH,
      ],
    },
    {
      module: MODULES.TAX,
      actions: [
        PERMISSIONS.CREATE_TAX,
        PERMISSIONS.VIEW_TAX,
        PERMISSIONS.EDIT_TAX,
        PERMISSIONS.DELETE_TAX,
      ],
    },
  ],

  [ROLES.MANAGER]: [
    {
      module: MODULES.USER,
      actions: [PERMISSIONS.VIEW_USER, PERMISSIONS.EDIT_USER],
    },
    {
      module: MODULES.ORGANIZATION,
      actions: [
        PERMISSIONS.VIEW_ORGANIZATION,
        PERMISSIONS.SEND_INVITATION,
      ],
    },
    {
      module: MODULES.FIRM,
      actions: [
        PERMISSIONS.VIEW_FIRM,
        PERMISSIONS.EDIT_FIRM,
        PERMISSIONS.CREATE_FIRM,
        PERMISSIONS.VIEW_TRASH,
        PERMISSIONS.RESTORE_FIRM
      
      ],
    },
    {
      module: MODULES.CLIENT,
      actions: [
        PERMISSIONS.CREATE_CLIENT,
        PERMISSIONS.VIEW_CLIENT,
        PERMISSIONS.EDIT_CLIENT,
           PERMISSIONS.RESTORE_CLIENT,
        PERMISSIONS.VIEW_TRASH,
      ],
    },
    {
      module: MODULES.INVOICE,
      actions: [
        PERMISSIONS.CREATE_INVOICE,
        PERMISSIONS.VIEW_INVOICE,
        PERMISSIONS.EDIT_INVOICE,
        PERMISSIONS.RESTORE_INVOICE,
        PERMISSIONS.VIEW_TRASH
      ],
    },
    {
      module: MODULES.LEAD,
      actions: [
        PERMISSIONS.CREATE_LEAD,
        PERMISSIONS.VIEW_LEAD,
        PERMISSIONS.EDIT_LEAD,
        PERMISSIONS.ASSIGN_LEAD,
        PERMISSIONS.RESTORE_LEAD,
        PERMISSIONS.VIEW_TRASH
      ],
    },
    {
      module: MODULES.TAX,
      actions: [PERMISSIONS.VIEW_TAX],
    },
  ],

  [ROLES.SUPPORT_AGENT]: [
    {
      module: MODULES.USER,
      actions: [PERMISSIONS.VIEW_USER],
    },
    {
      module: MODULES.FIRM,
      actions: [PERMISSIONS.VIEW_FIRM],
    },
    {
      module: MODULES.CLIENT,
      actions: [PERMISSIONS.VIEW_CLIENT],
    },
    {
      module: MODULES.INVOICE,
      actions: [PERMISSIONS.VIEW_INVOICE],
    },
    {
      module: MODULES.LEAD,
      actions: [PERMISSIONS.VIEW_LEAD],
    },
  ],

[ROLES.USER]: [
  {
    module: MODULES.ORGANIZATION,
    actions: [
      PERMISSIONS.VIEW_ORGANIZATION,
    ],
  },
  {
    module: MODULES.CLIENT,
    actions: [
      PERMISSIONS.VIEW_CLIENT,
      // PERMISSIONS.EDIT_CLIENT,
    ],
  },
  {
    module: MODULES.INVOICE,
    actions: [
      PERMISSIONS.VIEW_INVOICE,
     
    ],
  },
  {
    module: MODULES.LEAD,
    actions: [
      PERMISSIONS.VIEW_LEAD,
    ],
  },
],
};

