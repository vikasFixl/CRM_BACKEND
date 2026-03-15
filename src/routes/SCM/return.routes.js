import express from "express";
import { isAuthenticated } from "../../middleweare/middleware.js";
import { authenticateOrgToken } from "../../middleweare/orgmiddleware.js";
import {
  createReturn,
  getReturns,
  approveReturn,
  receiveReturn,
} from "../../controllers/SCM/return.controller.js";

const router = express.Router();

router.post("/returns", isAuthenticated, authenticateOrgToken(), createReturn);
router.get("/returns", isAuthenticated, authenticateOrgToken(), getReturns);
router.post("/returns/:id/approve", isAuthenticated, authenticateOrgToken(), approveReturn);
router.post("/returns/:id/receive", isAuthenticated, authenticateOrgToken(), receiveReturn);

export default router;

