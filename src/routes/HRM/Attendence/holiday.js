import express from "express";
const holidayRouter = express.Router();

import { isAuthenticated } from "../../../middleweare/middleware.js";
import { authenticateOrgToken } from "../../../middleweare/orgmiddleware.js";

import {
  createHoliday,
  getHolidays,
  getEmployeeHolidays,
  updateHoliday,
  disableHoliday
} from "../../../controllers/NHRM/AttendenceAndTime/HolidayController.js";

/**
 * HR / ADMIN ROUTES
 */
holidayRouter.post(
  "/",
  isAuthenticated,
  authenticateOrgToken(),
  createHoliday
);

holidayRouter.get(
  "/",
  isAuthenticated,
  authenticateOrgToken(),
  getHolidays
);

holidayRouter.patch(
  "/:holidayId",
  isAuthenticated,
  authenticateOrgToken(),
  updateHoliday
);

holidayRouter.patch(
  "/:holidayId/disable",
  isAuthenticated,
  authenticateOrgToken(),
  disableHoliday
);

/**
 * EMPLOYEE ROUTE (READ ONLY)
 */
holidayRouter.get(
  "/employee/view",
  isAuthenticated,
  authenticateOrgToken(),
  getEmployeeHolidays
);

export default holidayRouter;
