import express from "express";
import { isAuthenticated } from "../../middleweare/middleware.js";
import { authenticateOrgToken } from "../../middleweare/orgmiddleware.js";
import {
  sendEdi,
  receiveEdi,
  getEdiTransactions,
  getEdiById,
} from "../../controllers/SCM/edi.controller.js";

const router = express.Router();

router.post("/edi/send", isAuthenticated, authenticateOrgToken(), sendEdi);
router.post("/edi/receive", isAuthenticated, authenticateOrgToken(), receiveEdi);
router.get("/edi", isAuthenticated, authenticateOrgToken(), getEdiTransactions);
router.get("/edi/:id", isAuthenticated, authenticateOrgToken(), getEdiById);

export default router;

