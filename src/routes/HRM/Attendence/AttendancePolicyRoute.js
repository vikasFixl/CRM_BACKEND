import express from "express";
const AttendancePolicyRouter = express.Router();

import { isAuthenticated } from "../../../middleweare/middleware.js";
import { authenticateOrgToken } from "../../../middleweare/orgmiddleware.js";

import {
  upsertPolicy,
  getActivePolicy
} from "../../../controllers/NHRM/AttendenceAndTime/attendancePolicyController.js";

/**
 * CREATE / UPDATE POLICY (HR/Admin only)
 */
AttendancePolicyRouter.route("/")
  .post(
    isAuthenticated,
    authenticateOrgToken(),
    upsertPolicy
  );

/**
 * GET ACTIVE POLICY (System + HR)
 */
AttendancePolicyRouter.route("/active")
  .get(
    isAuthenticated,
    authenticateOrgToken(),
    getActivePolicy
  );

export default AttendancePolicyRouter;
