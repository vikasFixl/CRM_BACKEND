import express from "express";
const LeaveBalanceRouter = express.Router();

import { isAuthenticated } from "../../../middleweare/middleware.js";
import { authenticateOrgToken } from "../../../middleweare/orgmiddleware.js";

import {
  getMyLeaveBalance,
  getEmployeeLeaveBalance
} from "../../../controllers/NHRM/AttendenceAndTime/leaveBalanceController.js";

/* Employee */
LeaveBalanceRouter.get(
  "/me",
  isAuthenticated,
  authenticateOrgToken(),
  getMyLeaveBalance
);

/* HR */
LeaveBalanceRouter.get(
  "/employee/:employeeId",
  isAuthenticated,
  authenticateOrgToken(),
  getEmployeeLeaveBalance
);

export default LeaveBalanceRouter;
