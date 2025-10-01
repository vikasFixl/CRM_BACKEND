import express from "express";
import {  activatePlan, createPlan, deactivatePlan, getAllPlans, getPlanById, updatePlan} from "../../controllers/BillingPlanController.js";
import { isAuthenticated } from "../../middleweare/middleware.js";
const BillingRouter = express.Router();

BillingRouter.route("/create").post( isAuthenticated,createPlan);
BillingRouter.route("/all").get( isAuthenticated,getAllPlans);
BillingRouter.route("/:id").get( isAuthenticated,getPlanById);
BillingRouter.route("/activate/:id").patch( isAuthenticated,activatePlan);
BillingRouter.route("/deactivate/:id").patch( isAuthenticated,deactivatePlan);
BillingRouter.route("/update/:id").patch( isAuthenticated,updatePlan);


export default BillingRouter;
