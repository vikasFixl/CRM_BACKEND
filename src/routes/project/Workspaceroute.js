import express from "express";
const WorkspaceRouter = express.Router();
import { isAuthenticated } from "../../middleweare/middleware.js";
import { authenticateOrgToken } from "../../middleweare/orgmiddleware.js";
import { createWorkspace,deleteWorkspace,updateWorkspace ,getAllWorkspace, getMyWorkspace, getWorkspaceById, getWorkspaceAnalytics} from "../../controllers/project/Workspace.controller.js";


WorkspaceRouter.route("/:workspaceId").get(isAuthenticated, authenticateOrgToken(),getWorkspaceById);
WorkspaceRouter.route("/admin/all").get(isAuthenticated, authenticateOrgToken(), getAllWorkspace);
WorkspaceRouter.route("/my-workspace/all").get(isAuthenticated, authenticateOrgToken(), getMyWorkspace);
WorkspaceRouter.route("/:workspaceId/Analytics").get(isAuthenticated, authenticateOrgToken(),getWorkspaceAnalytics);
// soft delete
WorkspaceRouter.route("/create").post(isAuthenticated, authenticateOrgToken(), createWorkspace);
WorkspaceRouter.route("/delete/:id").patch(isAuthenticated, authenticateOrgToken(), deleteWorkspace);
WorkspaceRouter.route("/update/:id").patch(isAuthenticated, authenticateOrgToken(), updateWorkspace);










export default WorkspaceRouter