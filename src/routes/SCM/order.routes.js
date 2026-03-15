import express from "express";
import { isAuthenticated } from "../../middleweare/middleware.js";
import { authenticateOrgToken } from "../../middleweare/orgmiddleware.js";
import {
  createOrder,
  getOrders,
  getOrderById,
  confirmOrder,
  pickOrder,
  packOrder,
  cancelOrder,
} from "../../controllers/SCM/OrderController.js";

const router = express.Router();

router.post("/orders", isAuthenticated, authenticateOrgToken(), createOrder);
router.get("/orders", isAuthenticated, authenticateOrgToken(), getOrders);
router.get("/orders/:id", isAuthenticated, authenticateOrgToken(), getOrderById);
router.post("/orders/:id/confirm", isAuthenticated, authenticateOrgToken(), confirmOrder);
router.post("/orders/:id/pick", isAuthenticated, authenticateOrgToken(), pickOrder);
router.post("/orders/:id/pack", isAuthenticated, authenticateOrgToken(), packOrder);
router.post("/orders/:id/cancel", isAuthenticated, authenticateOrgToken(), cancelOrder);

export default router;

