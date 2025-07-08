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
  updateLeadStatus,
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
  checkPermission("lead", "CREATE_LEAD"),
  createLead
);
// GET ALL LEADS
LeadRouter.route("/getAllLeads").get(
  isAuthenticated,
  authenticateOrgToken(),
  checkPermission("lead", "VIEW_ONLY"),
  getAllLeads
);
// get lead stage-history
LeadRouter.route("/:id/stage-history").get(
  isAuthenticated,
  authenticateOrgToken(),
  checkPermission("lead", "VIEW_ONLY"),
  getLeadStageHistory
);

// Upload leads via Excel
// LeadRouter.route("/leads/upload-excel")
//   .post(uploadLeadsByExcel);

// Get single lead | Update lead
LeadRouter.route("/filter/status").post(isAuthenticated,authenticateOrgToken(),getLeadsByStatusAndFirm)
LeadRouter.route("/:id").get(isAuthenticated,authenticateOrgToken(),checkPermission("lead", "VIEW_ONLY"),getLeadById);
LeadRouter.route("/update/:id").patch(isAuthenticated,authenticateOrgToken(),checkPermission("lead", "EDIT_LEAD"),updateLead);

// Update stage of a lead
LeadRouter.route("/:id/stage").patch(isAuthenticated,authenticateOrgToken(),checkPermission("lead", "EDIT_LEAD"),updateLeadStage);
LeadRouter.route("/update/status/:id").patch(isAuthenticated,authenticateOrgToken(),checkPermission("lead", "EDIT_LEAD"),updateLeadStatus);

// Bulk delete leads
LeadRouter.route("/bulk-delete").delete(
  isAuthenticated,
  authenticateOrgToken(),
  checkPermission("lead", "DELETE_LEAD"),
  bulkDeleteLeads
);
// to get all deleted leads
LeadRouter.route("/deleted/all").get(
  isAuthenticated,
  authenticateOrgToken(),
  checkPermission("lead", "VIEW_TRASH"),
  getAllDeletedLead
);
LeadRouter.route("/restore/:id").patch(
  isAuthenticated,
  authenticateOrgToken(),
  checkPermission("lead", "RESTORE_LEAD"),
  restoreLead
);

export default LeadRouter;
