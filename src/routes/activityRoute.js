// routes/activityRoutes.js (ES module)
import express from "express";
import {
  getActivitiesByModule,
  deleteActivityById,
} from "../controllers/activityController.js";
import { isAuthenticated } from "../middleweare/middleware.js";
import { authenticateOrgToken } from "../middleweare/orgmiddleware.js";
const ActivityRouter = express.Router();


//http://localhost:5000/api/activity/module/lead?page=2&limit=5

// Get activities by module
ActivityRouter.route("/module/:module").get(isAuthenticated, authenticateOrgToken(),getActivitiesByModule);

// Delete a single activity by its ID
ActivityRouter.route("/:id").delete(isAuthenticated, authenticateOrgToken(),deleteActivityById);

export default ActivityRouter;
