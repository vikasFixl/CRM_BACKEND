import express from "express";
const TaskRouter = express.Router();
import { isAuthenticated } from "../../middleweare/middleware.js";
import { authenticateOrgToken } from "../../middleweare/orgmiddleware.js";
import {
  createTask,
  deleteTask,
  GetAllSubTasks,
  getAllTasks,

  getTaskById,
  getTasksByBoardColumn,
  reorderTasks,
  updateTask,
} from "../../controllers/project/Task.controller.js";

TaskRouter.route("/:projectId/create").post(
  isAuthenticated,
  authenticateOrgToken(),
  createTask
);
TaskRouter.route("/:projectId/all").get(
  isAuthenticated,
  authenticateOrgToken(),
  getAllTasks
);
TaskRouter.route("/project/:projectId/:taskId/delete").delete(
  isAuthenticated,
  authenticateOrgToken(),
  // checkProjectPermission(PERMISSIONS.DELETE_TASK),
  deleteTask
);
TaskRouter.route("/project/:projectId/:taskId/subtasks").get(
  isAuthenticated,
  authenticateOrgToken(),
  // checkProjectPermission(PERMISSIONS.DELETE_TASK),
  GetAllSubTasks
);
TaskRouter.route("/:taskId").get(
  isAuthenticated,
  authenticateOrgToken(),
  getTaskById
);
TaskRouter.route("/project/:projectId/:taskId/update").patch(
  isAuthenticated,
  authenticateOrgToken(),
  // checkProjectPermission(PERMISSIONS.DELETE_TASK),
  updateTask
);
TaskRouter.route("/project/:projectId/:taskId/re-order").patch(
  isAuthenticated,
  authenticateOrgToken(),
  // checkProjectPermission(PERMISSIONS.DELETE_TASK),
  reorderTasks
)
TaskRouter.route("/:boardId/by-board").get(
  isAuthenticated,
  authenticateOrgToken(),
  getTasksByBoardColumn
);


export default TaskRouter;
