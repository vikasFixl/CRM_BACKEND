import express from "express";
import { isAuthenticated } from "../../middleweare/middleware.js";
import { authenticateOrgToken } from "../../middleweare/orgmiddleware.js";
import {
  createStockTransfer,
  getStockTransfers,
  approveStockTransfer,
  completeStockTransfer,
} from "../../controllers/SCM/stockTransfer.controller.js";

const router = express.Router();

router.post("/stock-transfers", isAuthenticated, authenticateOrgToken(), createStockTransfer);
router.get("/stock-transfers", isAuthenticated, authenticateOrgToken(), getStockTransfers);
router.post(
  "/stock-transfers/:id/approve",
  isAuthenticated,
  authenticateOrgToken(),
  approveStockTransfer
);
router.post(
  "/stock-transfers/:id/complete",
  isAuthenticated,
  authenticateOrgToken(),
  completeStockTransfer
);

export default router;

