import express from "express";
import { isAuthenticated } from "../../../middleweare/middleware.js";
import { authenticateOrgToken } from "../../../middleweare/orgmiddleware.js";
import { createFeedback, deleteFeedback, getAllFeedbacks, getEmployeeFeedbacks, getFeedbackById } from "../../../controllers/NHRM/performance/feedbackController.js";
const feedbackRouter = express.Router();


feedbackRouter.route("/").post(isAuthenticated,authenticateOrgToken(),createFeedback)
feedbackRouter.route("/all").get(isAuthenticated,authenticateOrgToken(),getAllFeedbacks)
feedbackRouter.route("/:feedbackId").get(isAuthenticated,authenticateOrgToken(),getFeedbackById)
feedbackRouter.route("/:feedbackId/delete").get(isAuthenticated,authenticateOrgToken(),deleteFeedback)
feedbackRouter.route("/mine").get(isAuthenticated,authenticateOrgToken(),getEmployeeFeedbacks)









export default feedbackRouter;