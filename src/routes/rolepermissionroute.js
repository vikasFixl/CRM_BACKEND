import express from "express";


import { createCustomRolePermission, deleteRole, getAllRolePermissions, getRoleNamesList, updateRole } from "../controllers/rolepermission.js";
import { isAuthenticated } from "../middleweare/middleware.js";
import { authenticateOrgToken } from "../middleweare/orgmiddleware.js";
const RolePermissionRouter = express.Router();

RolePermissionRouter.route("/create").post(isAuthenticated, authenticateOrgToken(), createCustomRolePermission);
RolePermissionRouter.route("/all").get(isAuthenticated, authenticateOrgToken(), getAllRolePermissions);
RolePermissionRouter.route("/list").get(isAuthenticated, authenticateOrgToken(), getRoleNamesList);
RolePermissionRouter.route("/:id").delete(isAuthenticated, authenticateOrgToken(),deleteRole);
RolePermissionRouter.route("/:id").patch(isAuthenticated, authenticateOrgToken(),updateRole);





export default RolePermissionRouter