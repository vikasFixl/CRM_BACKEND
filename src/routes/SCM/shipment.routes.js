import express from "express";
import { isAuthenticated } from "../../middleweare/middleware.js";
import { authenticateOrgToken } from "../../middleweare/orgmiddleware.js";
import {
  createShipment,
  dispatchShipment,
} from "../../controllers/SCM/ShipmentController.js";

const router = express.Router();

router.post("/shipments", isAuthenticated, authenticateOrgToken(), createShipment);
router.post("/shipments/:id/dispatch", isAuthenticated, authenticateOrgToken(), dispatchShipment);

export default router;

