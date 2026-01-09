import express from "express";
const Regularizationrouter = express.Router();

import { isAuthenticated } from "../../../middleweare/middleware.js";
import { authenticateOrgToken } from "../../../middleweare/orgmiddleware.js";

import {
  requestRegularization,
  approveRegularization,
  rejectRegularization
} from "../../../controllers/NHRM/AttendenceAndTime/attendenceRegularization.js";

/* Employee */
Regularizationrouter.post(
  "/request",
  isAuthenticated,
  authenticateOrgToken(),
  requestRegularization
);

/* HR */
Regularizationrouter.post(
  "/approve/:id",
  isAuthenticated,
  authenticateOrgToken(),
  approveRegularization
);

Regularizationrouter.post(
  "/reject/:id",
  isAuthenticated,
  authenticateOrgToken(),
  rejectRegularization
);

export default Regularizationrouter;
