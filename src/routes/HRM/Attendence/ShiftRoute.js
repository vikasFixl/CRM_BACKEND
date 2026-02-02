import express from "express";
const ShiftRouter = express.Router();
import { hrmAuth } from "../../../middleweare/middleware.js";



import {
    createShift,
    getActiveShifts,
    updateShift,
    disableShift,
    getShiftById
} from "../../../controllers/NHRM/AttendenceAndTime/ShiftMasterController.js";

/**
 * CREATE SHIFT (HR/Admin)
 */
ShiftRouter.route("/")
    .post(
       hrmAuth,
        createShift
    );

/**
 * GET ACTIVE SHIFTS (HR/System)
 */
ShiftRouter.route("/active")
    .get(
       hrmAuth,
        getActiveShifts
    );

/**
 * UPDATE / DISABLE SHIFT
 */
ShiftRouter.route("/:shiftId")
    .patch(
       hrmAuth,
        updateShift
    ).get(
       hrmAuth,
        getShiftById
    )
    .delete(
       hrmAuth,
        disableShift
    );

export default ShiftRouter;
