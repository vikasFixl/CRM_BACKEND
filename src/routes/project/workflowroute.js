import express from "express"
import { getWorkflow, getWorkflowForBoard, updateWorkflow} from "../../controllers/project/workflowcontroller.js";
import { isAuthenticated } from "../../middleweare/middleware.js";
import { authenticateOrgToken } from "../../middleweare/orgmiddleware.js";
const WorkflowRouter=express.Router();

// WorkflowRouter.route("/all").get(isAuthenticated,authenticateOrgToken(),getWorkflows)
WorkflowRouter.route("/:projectId/workflow/:workflowId").get(isAuthenticated,authenticateOrgToken(),getWorkflow)
WorkflowRouter.route("/:workflowId/update").patch(isAuthenticated,authenticateOrgToken(),updateWorkflow)
WorkflowRouter.route("/:boardId/workflow").get(isAuthenticated,authenticateOrgToken(),getWorkflowForBoard)







export default WorkflowRouter;