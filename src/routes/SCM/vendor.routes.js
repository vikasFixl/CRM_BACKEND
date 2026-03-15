import express from "express";
import { isAuthenticated } from "../../middleweare/middleware.js";
import { authenticateOrgToken } from "../../middleweare/orgmiddleware.js";
import {
  createVendor,
  getVendors,
  getVendorById,
  updateVendor,
  deleteVendor,
} from "../../controllers/SCM/vendor.controller.js";

const router = express.Router();

router.post("/vendors", isAuthenticated, authenticateOrgToken(), createVendor);
router.get("/vendors", isAuthenticated, authenticateOrgToken(), getVendors);
router.get("/vendors/:id", isAuthenticated, authenticateOrgToken(), getVendorById);
router.patch("/vendors/:id", isAuthenticated, authenticateOrgToken(), updateVendor);
router.delete("/vendors/:id", isAuthenticated, authenticateOrgToken(), deleteVendor);

export default router;

