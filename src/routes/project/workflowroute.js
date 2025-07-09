import express from "express"
import { getWorkflow, updateWorkflow} from "../../controllers/project/workflowcontroller.js";
import { isAuthenticated } from "../../middleweare/middleware.js";
import { authenticateOrgToken } from "../../middleweare/orgmiddleware.js";
const WorkflowRouter=express.Router();

// WorkflowRouter.route("/all").get(isAuthenticated,authenticateOrgToken(),getWorkflows)
WorkflowRouter.route("/:projectId").get(isAuthenticated,authenticateOrgToken(),getWorkflow)
WorkflowRouter.route("/:workflowId/update").patch(isAuthenticated,authenticateOrgToken(),updateWorkflow)







export default WorkflowRouter;