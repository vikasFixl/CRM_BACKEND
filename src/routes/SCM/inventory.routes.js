import express from "express";
import { isAuthenticated } from "../../middleweare/middleware.js";
import { authenticateOrgToken } from "../../middleweare/orgmiddleware.js";
import {
  getInventory,
  getInventoryBySku,
  adjustInventory,
} from "../../controllers/SCM/inventory.controller.js";

const router = express.Router();

router.get("/inventory", isAuthenticated, authenticateOrgToken(), getInventory);
router.get("/inventory/:skuId", isAuthenticated, authenticateOrgToken(), getInventoryBySku);
router.post("/inventory/adjust", isAuthenticated, authenticateOrgToken(), adjustInventory);

export default router;

