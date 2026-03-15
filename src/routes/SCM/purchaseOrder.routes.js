import express from "express";
import { isAuthenticated } from "../../middleweare/middleware.js";
import { authenticateOrgToken } from "../../middleweare/orgmiddleware.js";
import {
  createPurchaseOrder,
  getPurchaseOrders,
  getPurchaseOrderById,
  updatePurchaseOrder,
  approvePurchaseOrder,
  receivePurchaseOrder,
} from "../../controllers/SCM/purchaseOrder.controller.js";

const router = express.Router();

router.post("/purchase-orders", isAuthenticated, authenticateOrgToken(), createPurchaseOrder);
router.get("/purchase-orders", isAuthenticated, authenticateOrgToken(), getPurchaseOrders);
router.get("/purchase-orders/:id", isAuthenticated, authenticateOrgToken(), getPurchaseOrderById);
router.patch("/purchase-orders/:id", isAuthenticated, authenticateOrgToken(), updatePurchaseOrder);
router.post(
  "/purchase-orders/:id/approve",
  isAuthenticated,
  authenticateOrgToken(),
  approvePurchaseOrder
);
router.post(
  "/purchase-orders/:id/receive",
  isAuthenticated,
  authenticateOrgToken(),
  receivePurchaseOrder
);

export default router;

