import express from "express";
import { isAuthenticated } from "../../../middleweare/middleware.js";
import { authenticateOrgToken } from "../../../middleweare/orgmiddleware.js";
import { createGoal, deleteGoal, getAllGoals, getGoalById, getMyGoals, updateGoal } from "../../../controllers/NHRM/performance/goalcontroller.js";
const goalRouter = express.Router();

goalRouter.route("/").post(isAuthenticated,authenticateOrgToken(),createGoal);
goalRouter.route("/all").get(isAuthenticated,authenticateOrgToken(),getAllGoals);
goalRouter.route("/mine").get(isAuthenticated,authenticateOrgToken(),getMyGoals);
goalRouter.route("/:goalId").get(isAuthenticated,authenticateOrgToken(),getGoalById).patch(isAuthenticated,authenticateOrgToken(),updateGoal).delete(isAuthenticated,authenticateOrgToken(),deleteGoal);


export default goalRouter;