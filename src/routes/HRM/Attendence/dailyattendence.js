import express from "express";
const DailyAttendanceRouter = express.Router();

import { hrmAuth } from "../../../middleweare/middleware.js";


import {
  getMyAttendance,
  getEmployeeAttendance,
  overrideAttendance,
  lockAttendanceForPayroll,
  lockEmployeeAttendance,
  unlockEmployeeAttendance
} from "../../../controllers/NHRM/AttendenceAndTime/dailyAttendanceController.js";

/* Employee */
DailyAttendanceRouter.get(
  "/me",
  hrmAuth,
  getMyAttendance
);

/* HR */
DailyAttendanceRouter.get(
  "/employee/:employeeId",
  hrmAuth,
  getEmployeeAttendance
);

DailyAttendanceRouter.patch(
  "/:attendanceId/override",
  hrmAuth,
  overrideAttendance
);

/* Payroll */
DailyAttendanceRouter.post(
  "/lock",
  hrmAuth,
  lockAttendanceForPayroll
);
DailyAttendanceRouter.post(
  "/employee/:employeeId/lock",
  hrmAuth,
  lockEmployeeAttendance
);
DailyAttendanceRouter.post(
  "/employee/:employeeId/unlock",
  hrmAuth,
  unlockEmployeeAttendance
);

export default DailyAttendanceRouter;
