const express = require("express");
const authorize = require("../../utils/authorize");
const assignedTaskRoutes = express.Router();
const {
  createAssignedTask,
  getAllAssignedTask,
  getAssignedTaskById,
  updateAssignedTask,
  deleteAssignedTask,
} = require("../../controllers/HRM/assignedTask");

assignedTaskRoutes.post(
  "/",
//   authorize("create-assignedTask"),
  createAssignedTask
);
assignedTaskRoutes.get(
  "/",
//   authorize("readAll-assignedTask"),
  getAllAssignedTask
);
assignedTaskRoutes.get(
  "/:id",
//   authorize("readSingle-assignedTask"),
  getAssignedTaskById
);
assignedTaskRoutes.put(
  "/:id",
//   authorize("update-assignedTask"),
  updateAssignedTask
);
assignedTaskRoutes.patch(
  "/:id",
//   authorize("delete-assignedTask"),
  deleteAssignedTask
);

module.exports = assignedTaskRoutes;
