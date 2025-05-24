import express from "express";

import { createRolePermission, getallroles } from "../controllers/RolePermissionController.js";
const Router = express.Router();

Router.route("/create").post( createRolePermission);
Router.route("/").get( getallroles);



// router.patch("/update/:id", updateRole);

// router.delete("/delete/:id", deleteRole);

export default Router;
