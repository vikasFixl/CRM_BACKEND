import express from "express";
const TaskRouter = express.Router();
import { isAuthenticated } from "../../middleweare/middleware.js";
import { authenticateOrgToken } from "../../middleweare/orgmiddleware.js";
import {
  createTask,
  getAllTasks,
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

export default TaskRouter;
