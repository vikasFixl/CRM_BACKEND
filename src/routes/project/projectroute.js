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
} from "../../controllers/project/Project.controller.js";

const ProjectRouter = express.Router();

// 🆕 Create a project from template
ProjectRouter.route("/create/:workspaceId").post(isAuthenticated, authenticateOrgToken(),createProject);

// ✏️ Update project details
ProjectRouter.route("/update/:projectId").patch(isAuthenticated, authenticateOrgToken(), updateProject);

// 🗑 Soft delete
ProjectRouter.route("/delete/:projectId").patch(isAuthenticated, authenticateOrgToken(), deleteProject);

// 📁 Archive
ProjectRouter.route("/archive/:projectId").patch(isAuthenticated, authenticateOrgToken(), archiveProject);

// 🔍 Get all projects for a workspace
ProjectRouter.route("/workspace/:workspaceId").get(isAuthenticated, authenticateOrgToken(), getAllProjectsByWorkspace);

// 🔍 Get one project
ProjectRouter.route("/get/:projectId").get(isAuthenticated, authenticateOrgToken(), getProjectById);

export default ProjectRouter;
