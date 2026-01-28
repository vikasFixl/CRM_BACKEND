import express from "express";
const employeeShiftAssignmentRouter = express.Router();

import { hrmAuth } from "../../../middleweare/middleware.js";

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
  hrmAuth,
  assignShift
);

/**
 * Disable an active shift assignment
 * (exit, suspension, temporary removal)
 */
employeeShiftAssignmentRouter.patch(
  "/:assignmentId/disable",
  hrmAuth,
  disableShiftAssignment
);

/**
 * Get full shift history for an employee
 */
employeeShiftAssignmentRouter.get(
  "/employee/:employeeId/history",
  hrmAuth,
  getShiftHistory
);

/**
 * Get current active shift for an employee
 */
employeeShiftAssignmentRouter.get(
  "/employee/:employeeId/current",
  hrmAuth,
  getCurrentShift
);

export default employeeShiftAssignmentRouter;
