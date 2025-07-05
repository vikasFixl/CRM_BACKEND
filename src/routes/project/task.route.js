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

TaskRouter.route("/create").post(
  isAuthenticated,
  authenticateOrgToken(),
  createTask
);
TaskRouter.route("/:projectId/all").get(
  isAuthenticated,
  authenticateOrgToken(),
  getAllTasks
);
TaskRouter.route("/projects/:projectId/tasks/:taskId").delete(
  isAuthenticated,
  authenticateOrgToken(),
  // checkProjectPermission(PERMISSIONS.DELETE_TASK),
  deleteTask
);
TaskRouter.route("/projects/:projectId/tasks/:taskId/subtasks").get(
  isAuthenticated,
  authenticateOrgToken(),
  // checkProjectPermission(PERMISSIONS.DELETE_TASK),
  GetAllSubTasks
);
TaskRouter.route("/:projectId/task/:taskId").get(
  isAuthenticated,
  authenticateOrgToken(),
  getTaskById
);
TaskRouter.route("/:projectId/task/:taskId").patch(
  isAuthenticated,
  authenticateOrgToken(),
  // checkProjectPermission(PERMISSIONS.DELETE_TASK),
  updateTask
);
TaskRouter.route("/:boardId/re-order").patch(
  isAuthenticated,
  authenticateOrgToken(),
  // checkProjectPermission(PERMISSIONS.DELETE_TASK),
  reorderTasks
)
TaskRouter.route("/:projectId/by-board").get(
  isAuthenticated,
  authenticateOrgToken(),
getTasksByBoardColumn
);


export default TaskRouter;
