import express from "express";
import { isAuthenticated } from "../../middleweare/middleware.js";
import { authenticateOrgToken } from "../../middleweare/orgmiddleware.js";
import {
  getWarehouseLocations,
  createWarehouseLocation,
  updateWarehouseLocation,
} from "../../controllers/SCM/warehouseLocation.controller.js";

const router = express.Router();

router.get(
  "/warehouse-locations",
  isAuthenticated,
  authenticateOrgToken(),
  getWarehouseLocations
);
router.post(
  "/warehouse-locations",
  isAuthenticated,
  authenticateOrgToken(),
  createWarehouseLocation
);
router.patch(
  "/warehouse-locations/:id",
  isAuthenticated,
  authenticateOrgToken(),
  updateWarehouseLocation
);

export default router;

