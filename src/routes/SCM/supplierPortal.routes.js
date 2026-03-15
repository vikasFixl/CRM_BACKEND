import express from "express";
import { isAuthenticated } from "../../middleweare/middleware.js";
import { authenticateOrgToken } from "../../middleweare/orgmiddleware.js";
import {
  getSupplierOrders,
  confirmSupplierOrder,
  createSupplierShipment,
} from "../../controllers/SCM/supplierPortal.controller.js";

const router = express.Router();

router.get("/supplier/orders", isAuthenticated, authenticateOrgToken(), getSupplierOrders);
router.post(
  "/supplier/orders/:id/confirm",
  isAuthenticated,
  authenticateOrgToken(),
  confirmSupplierOrder
);
router.post("/supplier/shipments", isAuthenticated, authenticateOrgToken(), createSupplierShipment);

export default router;

