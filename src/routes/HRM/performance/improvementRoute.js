import express from "express";
import { isAuthenticated } from "../../../middleweare/middleware.js";
import { authenticateOrgToken } from "../../../middleweare/orgmiddleware.js";
import { createImprovementPlan, deleteImprovementPlan, getAllImprovementPlans, getImprovementPlanById, getMyImprovementPlans, updateImprovementPlan } from "../../../controllers/NHRM/performance/improvementcontroller.js";
const ImprovementRouter = express.Router();


ImprovementRouter.route("/").post(isAuthenticated,authenticateOrgToken(),createImprovementPlan)
ImprovementRouter.route("/all").get(isAuthenticated,authenticateOrgToken(),getAllImprovementPlans)
ImprovementRouter.route("/:improvementId").get(isAuthenticated,authenticateOrgToken(),getImprovementPlanById)
ImprovementRouter.route("/mine").get(isAuthenticated,authenticateOrgToken(),getMyImprovementPlans)
ImprovementRouter.route("/:improvementId").patch(isAuthenticated,authenticateOrgToken(),updateImprovementPlan)
ImprovementRouter.route("/:improvementId/delete").get(isAuthenticated,authenticateOrgToken(),deleteImprovementPlan)