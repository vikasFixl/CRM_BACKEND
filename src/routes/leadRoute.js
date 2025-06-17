import express from "express";
import {
  bulkDeleteLeads,
  createLead,
  getAllDeletedLead,
  getAllLeads,
  getLeadById,
  getLeadsByStatusAndFirm,
  getLeadStageHistory,
  restoreLead,
  updateLead,
  updateLeadStage,
} from "../controllers/leadController.js";
import {
  checkPermission,
  authenticateOrgToken,
} from "../middleweare/orgmiddleware.js";
import { isAuthenticated } from "../middleweare/middleware.js";

// need to implement lead permission and rate limmiter
const LeadRouter = express.Router();

// Create lead | Get all leads
LeadRouter.route("/create").post(
  isAuthenticated,
  authenticateOrgToken(),
  createLead
);
// GET ALL LEADS
LeadRouter.route("/getAllLeads").get(
  isAuthenticated,
  authenticateOrgToken(),
  getAllLeads
);
// get lead stage-history
LeadRouter.route("/:id/stage-history").get(
  isAuthenticated,
  authenticateOrgToken(),
  getLeadStageHistory
);

// Upload leads via Excel
// LeadRouter.route("/leads/upload-excel")
//   .post(uploadLeadsByExcel);

// Get single lead | Update lead
LeadRouter.route("/filter/status").post(isAuthenticated,getLeadsByStatusAndFirm)
LeadRouter.route("/:id").get(getLeadById);
LeadRouter.route("/update/:id").patch(isAuthenticated,authenticateOrgToken(),updateLead);

// Update stage of a lead
LeadRouter.route("/:id/stage").patch(isAuthenticated,authenticateOrgToken(),updateLeadStage);

// Bulk delete leads
LeadRouter.route("/bulk-delete").delete(
  isAuthenticated,
  authenticateOrgToken(),
  bulkDeleteLeads
);

LeadRouter.route("/deleted/all").get(
  isAuthenticated,
  authenticateOrgToken(),
  getAllDeletedLead
);
LeadRouter.route("/restore/:id").patch(
  isAuthenticated,
  authenticateOrgToken(),
  restoreLead
);

export default LeadRouter;
