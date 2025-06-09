// config/rolepermission.js
import { ROLES, PERMISSIONS, MODULES } from "../enums/role.enums.js";

export const rolepermission = {
  [ROLES.SUPER_ADMIN]: [
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
      actions: [PERMISSIONS.VIEW_ORGANIZATION,
        PERMISSIONS.SEND_INVITATION,
       
      ],
    },
    {
      module: MODULES.FIRM,
      actions: [PERMISSIONS.VIEW_FIRM, PERMISSIONS.EDIT_FIRM,PERMISSIONS.CREATE_FIRM],
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
  ],

  [ROLES.USER]: [
    {
      module: MODULES.USER,
      actions: [PERMISSIONS.VIEW_USER],
    },
  ],
};
