import express from "express";
const LeaveTypeRouter = express.Router();

import { isAuthenticated } from "../../../middleweare/middleware.js";
import { authenticateOrgToken } from "../../../middleweare/orgmiddleware.js";

import {
  createLeaveType,
  getActiveLeaveTypes,
  updateLeaveType,
  disableLeaveType
} from "../../../controllers/NHRM/AttendenceAndTime/leaveTypeController.js";

LeaveTypeRouter.route("/")
  .post(isAuthenticated, authenticateOrgToken(), createLeaveType)
  .get(isAuthenticated, authenticateOrgToken(), getActiveLeaveTypes);

LeaveTypeRouter.route("/:leaveTypeId")
  .patch(isAuthenticated, authenticateOrgToken(), updateLeaveType)
  .delete(isAuthenticated, authenticateOrgToken(), disableLeaveType);

export default LeaveTypeRouter;
