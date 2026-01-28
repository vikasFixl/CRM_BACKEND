import express from "express";
const holidayRouter = express.Router();

import { hrmAuth } from "../../../middleweare/middleware.js";


import {
  createHoliday,
  getHolidays,
  updateHoliday,
  disableHoliday
} from "../../../controllers/NHRM/AttendenceAndTime/HolidayController.js";

/**
 * HR / ADMIN ROUTES
 */
holidayRouter.post(
  "/",
  hrmAuth,
  createHoliday
);

holidayRouter.get(
  "/",
  hrmAuth,
  getHolidays
);

holidayRouter.patch(
  "/:holidayId",
  hrmAuth,
  updateHoliday
);

holidayRouter.patch(
  "/:holidayId/disable",
  hrmAuth,
  disableHoliday
);



export default holidayRouter;
