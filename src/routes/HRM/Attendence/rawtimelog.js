import express from "express";
const RawTimeLogRouter = express.Router();

import { hrmAuth, isAuthenticated } from "../../../middleweare/middleware.js";
import { authenticateOrgToken } from "../../../middleweare/orgmiddleware.js";

import {
  punch,
  getTodayPunches,
  getEmployeeRawLogs
} from "../../../controllers/NHRM/AttendenceAndTime/rawTimelog.js";

RawTimeLogRouter.post(
  "/punch",
  hrmAuth,
  punch
);

// RawTimeLogRouter.post(
//   "/punch-out",
//   isAuthenticated,
//   authenticateOrgToken(),
//   punchOut
// );

RawTimeLogRouter.get(
  "/punches/today",
  hrmAuth,
  getTodayPunches
);

/* HR / ADMIN */
RawTimeLogRouter.get(
  "/employee/:employeeId/raw-logs",
  hrmAuth,
  getEmployeeRawLogs
);

export default RawTimeLogRouter;
