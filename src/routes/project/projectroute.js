import express from "express";
import { isAuthenticated } from "../../middleweare/middleware.js";
import { authenticateOrgToken } from "../../middleweare/orgmiddleware.js";
import {
  createProject,
  updateProject,
  deleteProject,
  getAllProjectsByWorkspace,
  getProjectById,
  archiveProject,
 
} from "../../controllers/project/project.controller.js";

const ProjectRouter = express.Router();
// /Project CRUD Routes (Under Workspace)

// 🆕 Create a project from template
ProjectRouter.route("/create/:workspaceId").post(isAuthenticated, authenticateOrgToken(),createProject);

// get all project under workspace
ProjectRouter.route("/workspace/:workspaceId/projects").get(isAuthenticated, authenticateOrgToken(), getAllProjectsByWorkspace);
// get project members
ProjectRouter.route("/workspace/:workspaceId/project/:projectId").get(isAuthenticated, authenticateOrgToken(),getProjectById);
// ✏️ Update project details
ProjectRouter.route("/update/:projectId").patch(isAuthenticated, authenticateOrgToken(), updateProject);

// 🗑 Soft delete
ProjectRouter.route("/delete/:projectId").delete(isAuthenticated, authenticateOrgToken(), deleteProject);

// // 📁 Archive
// ProjectRouter.route("/archive/:projectId").patch(isAuthenticated, authenticateOrgToken(), archiveProject);

// member routes 


export default ProjectRouter;
