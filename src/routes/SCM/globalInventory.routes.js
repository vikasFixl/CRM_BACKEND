import express from "express";
import { isAuthenticated } from "../../middleweare/middleware.js";
import { authenticateOrgToken } from "../../middleweare/orgmiddleware.js";
import {
  getGlobalInventory,
  getGlobalInventoryBySku,
} from "../../controllers/SCM/globalInventory.controller.js";

const router = express.Router();

router.get("/global-inventory", isAuthenticated, authenticateOrgToken(), getGlobalInventory);
router.get(
  "/global-inventory/:skuId",
  isAuthenticated,
  authenticateOrgToken(),
  getGlobalInventoryBySku
);

export default router;

