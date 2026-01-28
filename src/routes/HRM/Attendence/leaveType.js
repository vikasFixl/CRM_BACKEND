import express from "express";
const LeaveTypeRouter = express.Router();


import { hrmAuth } from "../../../middleweare/middleware.js";
import {
  createLeaveType,
  getActiveLeaveTypes,
  updateLeaveType,
  disableLeaveType
} from "../../../controllers/NHRM/AttendenceAndTime/leaveTypeController.js";

LeaveTypeRouter.route("/")
  .post(hrmAuth, createLeaveType)
  .get(hrmAuth, getActiveLeaveTypes);

LeaveTypeRouter.route("/:leaveTypeId")
  .patch(hrmAuth, updateLeaveType)
  .delete(hrmAuth, disableLeaveType);

export default LeaveTypeRouter;
