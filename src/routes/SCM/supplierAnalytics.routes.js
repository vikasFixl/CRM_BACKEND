import express from "express";
import { isAuthenticated } from "../../middleweare/middleware.js";
import { authenticateOrgToken } from "../../middleweare/orgmiddleware.js";
import {
  runSupplierAnalytics,
  getSupplierAnalytics,
  getSupplierAnalyticsByVendor,
} from "../../controllers/SCM/supplierAnalytics.controller.js";

const router = express.Router();

router.post("/supplier-analytics/run", isAuthenticated, authenticateOrgToken(), runSupplierAnalytics);
router.get("/supplier-analytics", isAuthenticated, authenticateOrgToken(), getSupplierAnalytics);
router.get(
  "/supplier-analytics/:vendorId",
  isAuthenticated,
  authenticateOrgToken(),
  getSupplierAnalyticsByVendor
);

export default router;

