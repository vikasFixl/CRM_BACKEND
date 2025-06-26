import express from "express";
const TaskRouter = express.Router();
import {isAuthenticated} from "../../middleweare/middleware.js"
import {authenticateOrgToken} from "../../middleweare/orgmiddleware.js";
import { createTask } from "../../controllers/project/Task.controller.js";


TaskRouter.route("/create").post(isAuthenticated, authenticateOrgToken(), createTask);















export default TaskRouter