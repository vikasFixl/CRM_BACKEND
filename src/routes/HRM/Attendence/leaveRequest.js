import express from "express";
const LeaveRequestRouter = express.Router();
import { hrmAuth } from "../../../middleweare/middleware.js";


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
  hrmAuth,
  createLeaveRequest
);

LeaveRequestRouter.get(
  "/me",
  hrmAuth,
  getMyLeaveRequests
);

/* HR */
LeaveRequestRouter.get(
  "/pending",
  hrmAuth,
  getPendingLeaveRequests
);

LeaveRequestRouter.post(
  "/approve/:id",
  hrmAuth,
  approveLeaveRequest
);

LeaveRequestRouter.post(
  "/reject/:id",
  hrmAuth,
  rejectLeaveRequest
);

export default LeaveRequestRouter;
