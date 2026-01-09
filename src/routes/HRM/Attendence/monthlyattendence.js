import express from "express";
const MonthlyAttendanceRouter = express.Router();

import { isAuthenticated } from "../../../middleweare/middleware.js";
import { authenticateOrgToken } from "../../../middleweare/orgmiddleware.js";

import {
  getEmployeeMonthlySummary,
  lockMonthlyAttendance,
  unlockMonthlyAttendance
} from "../../../controllers/NHRM/AttendenceAndTime/MonthlyAttendenceController.js";

/* HR */
MonthlyAttendanceRouter.get(
  "/employee/:employeeId",
  isAuthenticated,
  authenticateOrgToken(),
  getEmployeeMonthlySummary
);

/* Payroll */
MonthlyAttendanceRouter.post(
  "/lock",
  isAuthenticated,
  authenticateOrgToken(),
  lockMonthlyAttendance
);

MonthlyAttendanceRouter.post(
  "/unlock",
  isAuthenticated,
  authenticateOrgToken(),
  unlockMonthlyAttendance
);

export default MonthlyAttendanceRouter;
