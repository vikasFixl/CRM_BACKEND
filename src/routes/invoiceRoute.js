import express from "express";
const InvoiceRouter = express.Router();
import {
  cancelInvoice,
  createInvoice,
  finalizeDraftInvoice,
  getAllCancelInvoices,
  getAllDeletedInvoices,
  getAllInvoices,
  getDraftById,
  getDrafts,
  getInvoiceByClient,
  getInvoiceByFirm,
  getSingleInvoice,
  listInvoiceNo,
  moveToTrashInvoice,
  payment,
  permanentDeleteInvoice,
  restoreCancelInvoice,
  restoreInvoice,
 
  updateInvoiceStatus,
} from "../controllers/invoices.js";
import { isAuthenticated } from "../middleweare/middleware.js";
import { authenticateOrgToken, checkPermission } from "../middleweare/orgmiddleware.js";
// const { authorize } = require("../middleweare/middleware");

/// get routes

InvoiceRouter.route("/drafts").get(
  isAuthenticated,
  authenticateOrgToken(),
  checkPermission("invoice", "VIEW_INVOICE"),
  getDrafts
);
InvoiceRouter.route("/drafts/:id").get(
  isAuthenticated,
  authenticateOrgToken(),
  checkPermission("invoice", "VIEW_INVOICE"),
  getDraftById
);
// InvoiceInvoiceRouter.get("/cancel/:orgId", authorize('Read', 'invoice', ['Admin', 'subAdmin', 'Custom']), invoiceController.getCancel);
InvoiceRouter.route("/all").get(
  isAuthenticated,
  authenticateOrgToken(),
  checkPermission("invoice", "VIEW_INVOICE"),
  getAllInvoices
);
// InvoiceInvoiceRouter.get("/all/:orgId", authorize('Read', 'invoice', ['Admin', 'subAdmin', 'Custom']), invoiceController.getAllInvoices);
// InvoiceInvoiceRouter.get("/singleInvoice/:orgId/:id", authorize('Read', 'invoice', ['Admin', 'subAdmin', 'Custom']), invoiceController.getInvoice);
InvoiceRouter.route("/getAllCancelInvoices").get(
  isAuthenticated,
  authenticateOrgToken(),
  checkPermission("invoice", "VIEW_INVOICE"),
  getAllCancelInvoices
);
InvoiceRouter.route("/getAllDeletedInvoices").get(
  isAuthenticated,
  authenticateOrgToken(),
  checkPermission("invoice", "VIEW_TRASH"),
  getAllDeletedInvoices
);

/// post routes

// InvoiceInvoiceRouter.post("/checkout-stripe", invoiceController.paymnetlink1);
InvoiceRouter.route("/create").post(
  isAuthenticated,
  authenticateOrgToken(),
  checkPermission("invoice", "CREATE_INVOICE"),
  createInvoice
);
// InvoiceInvoiceRouter.post("/createrecurringinvoice", invoiceController.createInvoice);
InvoiceRouter.route("/getSingleInvoice").post(
  isAuthenticated,
  authenticateOrgToken(),
  checkPermission("invoice", "VIEW_INVOICE"),
  getSingleInvoice
);
InvoiceRouter.route("/getInvoiceByClient").post(
  isAuthenticated,
  authenticateOrgToken(),
  checkPermission("invoice", "VIEW_INVOICE"),
  getInvoiceByClient
);
InvoiceRouter.route("/getInvoiceByFirm").post(
  isAuthenticated,
  authenticateOrgToken(),
  checkPermission("invoice", "VIEW_INVOICE"),
  getInvoiceByFirm
);
InvoiceRouter.route("/listInvoiceNo").post(
  isAuthenticated,
  authenticateOrgToken(),
  checkPermission("invoice", "VIEW_INVOICE"),
  listInvoiceNo
);
// InvoiceInvoiceRouter.post("/listInvoiceNumber",  invoiceController.listInvoiceNo);

/// patch routes

// InvoiceRouter.patch("/updateInvoice/:id", authorize("Update", "invoice", ["Admin", "subAdmin", "Custom"]), invoiceController.updateInvoice);
// InvoiceRouter.patch("/updateInvoiceforrecurringinvoice/:id", invoiceController.updateInvoice);
InvoiceRouter.route("/drafttoinvoice/:id").patch(
  isAuthenticated,
  authenticateOrgToken(),
  checkPermission("invoice", "EDIT_INVOICE"),
  finalizeDraftInvoice
);
// InvoiceRouter.patch("/updateDraft/:id", authorize("Update", "invoice", ["Admin", "subAdmin", "Custom"]), invoiceController.updateDraftIn);
InvoiceRouter.route("/payment/:id").patch(isAuthenticated,authenticateOrgToken(),payment)
InvoiceRouter.route("/softDeleteInvoice/:id").patch(
  isAuthenticated,
  authenticateOrgToken(),
  checkPermission("invoice", "DELETE_INVOICE"),
  moveToTrashInvoice
);
InvoiceRouter.route("/updateInvoiceStatus/:id").patch(
  isAuthenticated,
  authenticateOrgToken(),
  checkPermission("invoice", "EDIT_INVOICE"),
  updateInvoiceStatus
);
InvoiceRouter.route("/cancelInvoice/:id").patch(
  isAuthenticated,
  authenticateOrgToken(),
  checkPermission("invoice", "EDIT_INVOICE"),
  cancelInvoice
);
InvoiceRouter.route("/restoreInvoice/:id").patch(
  isAuthenticated,
  authenticateOrgToken(),
  checkPermission("invoice", "RESTORE_INVOICE"),
  restoreInvoice
);
InvoiceRouter.route("/restoreCancelInvoice/:id").patch(
  isAuthenticated,
  authenticateOrgToken(),
  checkPermission("invoice", "RESTORE_INVOICE"),
  restoreCancelInvoice
);

/// delete routes

InvoiceRouter.route("/deleteInvoice/:id").delete(
  isAuthenticated,
  authenticateOrgToken(),
  checkPermission("invoice", "DELETE_INVOICE"),
  permanentDeleteInvoice
);

/// not in use

// InvoiceRouter.get("/count", invoiceController.getTotalCount);
// InvoiceRouter.get("/user", invoiceController.getInvoicesByUser);
// InvoiceRouter.get("/totalsell", invoiceController.totalsell);

export default InvoiceRouter;
