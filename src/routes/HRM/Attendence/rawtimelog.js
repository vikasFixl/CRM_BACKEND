import express from "express";
const RawTimeLogRouter = express.Router();

import { isAuthenticated } from "../../../middleweare/middleware.js";
import { authenticateOrgToken } from "../../../middleweare/orgmiddleware.js";

import {
  punchIn,
  punchOut,
  getTodayPunches,
  getEmployeeRawLogs
} from "../../../controllers/NHRM/AttendenceAndTime/rawTimelog.js";

RawTimeLogRouter.post(
  "/punch-in",
  isAuthenticated,
  authenticateOrgToken(),
  punchIn
);

RawTimeLogRouter.post(
  "/punch-out",
  isAuthenticated,
  authenticateOrgToken(),
  punchOut
);

RawTimeLogRouter.get(
  "/today",
  isAuthenticated,
  authenticateOrgToken(),
  getTodayPunches
);

/* HR / ADMIN */
RawTimeLogRouter.get(
  "/employee/:employeeId",
  isAuthenticated,
  authenticateOrgToken(),
  getEmployeeRawLogs
);

export default RawTimeLogRouter;
