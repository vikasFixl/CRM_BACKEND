import express from "express";
import { isAuthenticated } from "../../middleweare/middleware.js";
import { authenticateOrgToken } from "../../middleweare/orgmiddleware.js";
import {
  getReplenishmentSuggestions,
  approveReplenishment,
  rejectReplenishment,
} from "../../controllers/SCM/replenishment.controller.js";

const router = express.Router();

router.get("/replenishment", isAuthenticated, authenticateOrgToken(), getReplenishmentSuggestions);
router.post(
  "/replenishment/:id/approve",
  isAuthenticated,
  authenticateOrgToken(),
  approveReplenishment
);
router.post(
  "/replenishment/:id/reject",
  isAuthenticated,
  authenticateOrgToken(),
  rejectReplenishment
);

export default router;

