import express from "express";
const WorkspaceRouter = express.Router();
import { isAuthenticated } from "../../middleweare/middleware.js";
import { authenticateOrgToken } from "../../middleweare/orgmiddleware.js";
import { createWorkspace } from "../../controllers/project/Workspace.controller.js";

WorkspaceRouter.route("/create").post(isAuthenticated, authenticateOrgToken(), createWorkspace);










export default WorkspaceRouter