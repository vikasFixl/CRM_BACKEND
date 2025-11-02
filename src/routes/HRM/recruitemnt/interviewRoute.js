import express from "express";
import {
  createInterview,
  getInterviews,
  getInterview,
  updateInterviewFeedback,
  updateInterviewStatus,
  deleteInterview,
} from "../../../controllers/NHRM/Recruitment/InterviewController.js";
import { isAuthenticated } from "../../../middleweare/middleware.js";
import { authenticateOrgToken } from "../../../middleweare/orgmiddleware.js";

const InterviewRouter = express.Router();

// =========================
// Interview Routes
// =========================

// 👉 Create a new interview
InterviewRouter.post("/", isAuthenticated, authenticateOrgToken(), createInterview);

// 👉 Get all interviews (with filters like jobId, interviewerId, status)
InterviewRouter.get("/", isAuthenticated, authenticateOrgToken(), getInterviews);

// 👉 Get single interview by ID
InterviewRouter.get("/:interviewId", isAuthenticated, authenticateOrgToken(), getInterview);

// 👉 Update interview feedback
InterviewRouter.patch("/:interviewId/feedback", isAuthenticated, authenticateOrgToken(), updateInterviewFeedback);

// 👉 Update interview status
InterviewRouter.patch("/:interviewId/status", isAuthenticated, authenticateOrgToken(), updateInterviewStatus);

// 👉 Delete interview (only if status is Completed or Cancelled)
InterviewRouter.delete("/:interviewId", isAuthenticated, authenticateOrgToken(), deleteInterview);

export default InterviewRouter;
