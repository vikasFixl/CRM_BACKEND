import express from "express";
import { isAuthenticated } from "../../middleweare/middleware.js";
import { authenticateOrgToken } from "../../middleweare/orgmiddleware.js";
import {
  getTrackingByShipment,
  trackingWebhook,
} from "../../controllers/SCM/tracking.controller.js";

const router = express.Router();

router.get("/tracking/:shipmentId", isAuthenticated, authenticateOrgToken(), getTrackingByShipment);
router.post("/tracking/webhook", isAuthenticated, authenticateOrgToken(), trackingWebhook);

export default router;

