import express from "express";
import { createTemplate,updateTemplate,listTemplates,deleteTemplate,getTemplate } from "../../controllers/project/projectTemplate.controller.js";
import { isAuthenticated } from "../../middleweare/middleware.js";
import { authenticateOrgToken } from "../../middleweare/orgmiddleware.js";
const ProjectTemplateRouter = express.Router();

// /api/project-templates/
ProjectTemplateRouter.route("/")
  .get(isAuthenticated,authenticateOrgToken(),listTemplates)      // List system + org templates
  .post(isAuthenticated,authenticateOrgToken(),createTemplate);   // Create a new template

// /api/project-templates/:templateId
ProjectTemplateRouter.route("/:templateId")
  .get(isAuthenticated,authenticateOrgToken(),getTemplate)    // Get a specific template
  .put(updateTemplate)     // Update template
  .delete(deleteTemplate); // Delete template

export default ProjectTemplateRouter;
