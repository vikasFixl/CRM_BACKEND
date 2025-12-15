import express from "express";
const ShiftRouter = express.Router();

import { isAuthenticated } from "../../../middleweare/middleware.js";
import { authenticateOrgToken } from "../../../middleweare/orgmiddleware.js";

import {
    createShift,
    getActiveShifts,
    updateShift,
    disableShift
} from "../../../controllers/NHRM/AttendenceAndTime/ShiftMasterController.js";

/**
 * CREATE SHIFT (HR/Admin)
 */
ShiftRouter.route("/")
    .post(
        isAuthenticated,
        authenticateOrgToken(),
        createShift
    );

/**
 * GET ACTIVE SHIFTS (HR/System)
 */
ShiftRouter.route("/active")
    .get(
        isAuthenticated,
        authenticateOrgToken(),
        getActiveShifts
    );

/**
 * UPDATE / DISABLE SHIFT
 */
ShiftRouter.route("/:shiftId")
    .patch(
        isAuthenticated,
        authenticateOrgToken(),
        updateShift
    )
    .delete(
        isAuthenticated,
        authenticateOrgToken(),
        disableShift
    );

export default ShiftRouter;
