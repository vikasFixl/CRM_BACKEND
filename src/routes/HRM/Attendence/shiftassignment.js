import express from "express";
const employeeShiftAssignmentRouter = express.Router();

import { isAuthenticated } from "../../../middleweare/middleware.js";
import { authenticateOrgToken } from "../../../middleweare/orgmiddleware.js";

import {
  assignShift,
  getCurrentShift,
  disableShiftAssignment,
  getShiftHistory
} from "../../../controllers/NHRM/AttendenceAndTime/employeeShiftAssignmentController.js";

/**
 * 🔐 HR / ADMIN ONLY
 */

/**
 * Assign or change shift (onboarding / transfer / rotation)
 */
employeeShiftAssignmentRouter.post(
  "/assign",
  isAuthenticated,
  authenticateOrgToken(),
  assignShift
);

/**
 * Disable an active shift assignment
 * (exit, suspension, temporary removal)
 */
employeeShiftAssignmentRouter.patch(
  "/:assignmentId/disable",
  isAuthenticated,
  authenticateOrgToken(),
  disableShiftAssignment
);

/**
 * Get full shift history for an employee
 */
employeeShiftAssignmentRouter.get(
  "/employee/:employeeId/history",
  isAuthenticated,
  authenticateOrgToken(),
  getShiftHistory
);

/**
 * Get current active shift for an employee
 */
employeeShiftAssignmentRouter.get(
  "/employee/:employeeId/current",
  isAuthenticated,
  authenticateOrgToken(),
  getCurrentShift
);

export default employeeShiftAssignmentRouter;
