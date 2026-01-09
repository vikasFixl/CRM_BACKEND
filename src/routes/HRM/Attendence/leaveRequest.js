import express from "express";
const LeaveRequestRouter = express.Router();

import { isAuthenticated } from "../../../middleweare/middleware.js";
import { authenticateOrgToken } from "../../../middleweare/orgmiddleware.js";

import {
  createLeaveRequest,
  getMyLeaveRequests,
  getPendingLeaveRequests,
  approveLeaveRequest,
  rejectLeaveRequest
} from "../../../controllers/NHRM/AttendenceAndTime/leaveRequestController.js";

/* Employee */
LeaveRequestRouter.post(
  "/",
  isAuthenticated,
  authenticateOrgToken(),
  createLeaveRequest
);

LeaveRequestRouter.get(
  "/me",
  isAuthenticated,
  authenticateOrgToken(),
  getMyLeaveRequests
);

/* HR */
LeaveRequestRouter.get(
  "/pending",
  isAuthenticated,
  authenticateOrgToken(),
  getPendingLeaveRequests
);

LeaveRequestRouter.post(
  "/approve/:id",
  isAuthenticated,
  authenticateOrgToken(),
  approveLeaveRequest
);

LeaveRequestRouter.post(
  "/reject/:id",
  isAuthenticated,
  authenticateOrgToken(),
  rejectLeaveRequest
);

export default LeaveRequestRouter;
