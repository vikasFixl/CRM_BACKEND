import express from "express";
const DailyAttendanceRouter = express.Router();

import { isAuthenticated } from "../../../middleweare/middleware.js";
import { authenticateOrgToken } from "../../../middleweare/orgmiddleware.js";

import {
  getMyAttendance,
  getEmployeeAttendance,
  overrideAttendance,
  lockAttendanceForPayroll
} from "../../../controllers/NHRM/AttendenceAndTime/dailyAttendanceController.js";

/* Employee */
DailyAttendanceRouter.get(
  "/me",
  isAuthenticated,
  authenticateOrgToken(),
  getMyAttendance
);

/* HR */
DailyAttendanceRouter.get(
  "/employee/:employeeId",
  isAuthenticated,
  authenticateOrgToken(),
  getEmployeeAttendance
);

DailyAttendanceRouter.patch(
  "/override/:attendanceId",
  isAuthenticated,
  authenticateOrgToken(),
  overrideAttendance
);

/* Payroll */
DailyAttendanceRouter.post(
  "/lock",
  isAuthenticated,
  authenticateOrgToken(),
  lockAttendanceForPayroll
);

export default DailyAttendanceRouter;
