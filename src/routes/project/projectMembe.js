import express from "express"
import { assignMember, getAllProjectMembers } from "../../controllers/project/projectMember.controller.js";
import { authenticateOrgToken } from "../../middleweare/orgmiddleware.js";
import { isAuthenticated } from "../../middleweare/middleware.js";
const ProjectMemberRouter = express.Router()



// ProjectRouter.route("/:projectId/members").get(isAuthenticated, authenticateOrgToken(), getAllProjectsByWorkspace);
ProjectMemberRouter.route("/:projectId/members").post(isAuthenticated, authenticateOrgToken(), assignMember);
ProjectMemberRouter.route("/:projectId/members").get(isAuthenticated, authenticateOrgToken(),getAllProjectMembers);
ProjectMemberRouter.route("/:projectId/members/:memberId").patch(isAuthenticated, authenticateOrgToken(),getAllProjectMembers);
ProjectMemberRouter.route("/:projectId/members/:memberId").delete(isAuthenticated, authenticateOrgToken(),getAllProjectMembers);











export default ProjectMemberRouter;