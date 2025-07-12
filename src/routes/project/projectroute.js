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
  getAssignableMembers,
  getMyProjectsByWorkspace,
  getProjectAnalytics,
} from "../../controllers/project/project.controller.js";

const ProjectRouter = express.Router();
// /Project CRUD Routes (Under Workspace)

// 🆕 Create a project from template
ProjectRouter.route("/create/:workspaceId").post(
  isAuthenticated,
  authenticateOrgToken(),
  createProject
);

// get all project under workspace
ProjectRouter.route("/workspace/:workspaceId/projects").get(
  isAuthenticated,
  authenticateOrgToken(),
  getAllProjectsByWorkspace
);
ProjectRouter.route("/workspace/:workspaceId/my-projects").get(
  isAuthenticated,
  authenticateOrgToken(),
  getMyProjectsByWorkspace
);
// get project members
ProjectRouter.route("/:projectId").get(
  isAuthenticated,
  authenticateOrgToken(),
  getProjectById
);
ProjectRouter.route("/:projectId/assignable-members").get(
  isAuthenticated,
  authenticateOrgToken(),
  getAssignableMembers
);
ProjectRouter.route("/:projectId/Analytics").get(
  isAuthenticated,
  authenticateOrgToken(),
  getProjectAnalytics
);
// ✏️ Update project details
ProjectRouter.route("/update/:projectId").patch(
  isAuthenticated,
  authenticateOrgToken(),
  updateProject
);

// 🗑 Soft delete
ProjectRouter.route("/delete/:projectId").delete(
  isAuthenticated,
  authenticateOrgToken(),
  deleteProject
);

// // 📁 Archive
// ProjectRouter.route("/archive/:projectId").patch(isAuthenticated, authenticateOrgToken(), archiveProject);



export default ProjectRouter;
