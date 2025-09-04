import express from "express";
const WorkspaceRouter = express.Router();
import { isAuthenticated } from "../../middleweare/middleware.js";
import { authenticateOrgToken } from "../../middleweare/orgmiddleware.js";
import { createWorkspace,deleteWorkspace,updateWorkspace ,getAllWorkspace, getMyWorkspace, getWorkspaceById, getWorkspaceAnalytics, workspacemember, AddworkspaceMember, RemoveworkspaceMember} from "../../controllers/project/Workspace.controller.js";


WorkspaceRouter.route("/:workspaceId").get(isAuthenticated, authenticateOrgToken(),getWorkspaceById);
WorkspaceRouter.route("/admin/all").get(isAuthenticated, authenticateOrgToken(), getAllWorkspace);
WorkspaceRouter.route("/my-workspace/all").get(isAuthenticated, authenticateOrgToken(), getMyWorkspace);
WorkspaceRouter.route("/member/:workspaceId").get(isAuthenticated, authenticateOrgToken(),workspacemember);
WorkspaceRouter.route("/:workspaceId/Analytics").get(isAuthenticated, authenticateOrgToken(),getWorkspaceAnalytics);
// soft delete
WorkspaceRouter.route("/create").post(isAuthenticated, authenticateOrgToken(), createWorkspace);
WorkspaceRouter.route("/AddMember/:workspaceId").post(isAuthenticated, authenticateOrgToken(),AddworkspaceMember);
WorkspaceRouter.route("/delete/:id").patch(isAuthenticated, authenticateOrgToken(), deleteWorkspace);
WorkspaceRouter.route("/update/:id").patch(isAuthenticated, authenticateOrgToken(), updateWorkspace);
WorkspaceRouter.route("/RemoveMember/:workspaceId").patch(isAuthenticated, authenticateOrgToken(),RemoveworkspaceMember);










export default WorkspaceRouter