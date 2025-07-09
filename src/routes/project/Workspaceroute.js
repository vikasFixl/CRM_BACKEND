import express from "express";
const WorkspaceRouter = express.Router();
import { isAuthenticated } from "../../middleweare/middleware.js";
import { authenticateOrgToken } from "../../middleweare/orgmiddleware.js";
import { createWorkspace,deleteWorkspace,updateworkspace ,getAllWorkspace, getMyWorkspace, getWorkspaceById, getWorkspaceAnalytics} from "../../controllers/project/Workspace.controller.js";


WorkspaceRouter.route("/create").post(isAuthenticated, authenticateOrgToken(), createWorkspace);
WorkspaceRouter.route("/:workspaceId").get(isAuthenticated, authenticateOrgToken(),getWorkspaceById);
// soft delete
WorkspaceRouter.route("/delete/:id").patch(isAuthenticated, authenticateOrgToken(), deleteWorkspace);
WorkspaceRouter.route("/update/:id").patch(isAuthenticated, authenticateOrgToken(), updateworkspace);
WorkspaceRouter.route("/all").get(isAuthenticated, authenticateOrgToken(), getAllWorkspace);
WorkspaceRouter.route("/my-workspace").get(isAuthenticated, authenticateOrgToken(), getMyWorkspace);
WorkspaceRouter.route("/:workspaceId/Analytics").get(isAuthenticated, authenticateOrgToken(),getWorkspaceAnalytics);










export default WorkspaceRouter