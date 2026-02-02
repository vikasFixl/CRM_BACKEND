import express from "express";
const holidayRouter = express.Router();

import { hrmAuth } from "../../../middleweare/middleware.js";


import {
  createHoliday,
  getHolidays,
  updateHoliday,
  disableHoliday,
  getHolidayById
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
holidayRouter.get(
  "/:holidayId",
  hrmAuth,
  getHolidayById
);

holidayRouter.delete(
  "/:holidayId",
  hrmAuth,
  disableHoliday
);



export default holidayRouter;
