const express = require("express");
const { getAllPermission, createPermission, getSinglePermission, deletePermission, updatePermission } = require("../../controllers/HRM/permission");
const authorize = require("../../utils/authorize"); // authentication middleware

const permissionRoutes = express.Router();

permissionRoutes.post("/", 
// authorize("readAll-permission"),
createPermission);


permissionRoutes.get("/", 
// authorize("readAll-permission"),
 getAllPermission);

permissionRoutes.get("/:id", 
// authorize("readAll-permission"),
getSinglePermission);

permissionRoutes.put("/:id", 
// authorize("readAll-permission"),
updatePermission);

permissionRoutes.delete("/:id", 
// authorize("readAll-permission"),
deletePermission);

module.exports = permissionRoutes;
