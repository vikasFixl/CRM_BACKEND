import { authenticateOrgToken } from "../middleweare/orgmiddleware.js";
import { isAuthenticated } from "../middleweare/middleware.js";

import express from "express";
import { getBillingHistory, getCurrentPlanDetails } from "../controllers/orgbillingcontroller.js";
const OrgBillingRouter = express.Router();  

OrgBillingRouter.route("/current-plan").get(isAuthenticated,authenticateOrgToken(),getCurrentPlanDetails);
OrgBillingRouter.route("/history").get(isAuthenticated,authenticateOrgToken(),getBillingHistory);







export default OrgBillingRouter;