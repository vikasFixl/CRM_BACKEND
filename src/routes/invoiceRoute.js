import express from "express"
const InvoiceRouter = express.Router();
import { createInvoice } from "../controllers/invoices.js";
// const { authorize } = require("../middleweare/middleware");

/// get routes

// InvoiceInvoiceRouter.get("/drafts/:orgId", authorize('Read', 'invoice', ['Admin', 'subAdmin', 'Custom']), invoiceController.getDrafts);
// InvoiceInvoiceRouter.get("/cancel/:orgId", authorize('Read', 'invoice', ['Admin', 'subAdmin', 'Custom']), invoiceController.getCancel);
// InvoiceInvoiceRouter.get("/all/:orgId", authorize('Read', 'invoice', ['Admin', 'subAdmin', 'Custom']), invoiceController.getAllInvoices);
// InvoiceInvoiceRouter.get("/singleInvoice/:orgId/:id", authorize('Read', 'invoice', ['Admin', 'subAdmin', 'Custom']), invoiceController.getInvoice);
// InvoiceInvoiceRouter.get("/getAllCancelInvoices/:orgId", authorize('Read', 'invoice', ['Admin', 'subAdmin', 'Custom']), invoiceController.getAllCancelInvoices);
// InvoiceInvoiceRouter.get("/getAllDeletedInvoices/:orgId", authorize('Read', 'invoice', ['Admin', 'subAdmin', 'Custom']), invoiceController.getAllDeletedInvoices);

/// post routes

// InvoiceInvoiceRouter.post("/checkout-stripe", invoiceController.paymnetlink1);
InvoiceRouter.route("/create").post(createInvoice);
// InvoiceInvoiceRouter.post("/createrecurringinvoice", invoiceController.createInvoice);
// InvoiceInvoiceRouter.post("/getSingleInvoice", invoiceController.getSingleInvoice);
// InvoiceInvoiceRouter.post("/getInvoiceByClient", authorize("Read", "client", ["Admin", "subAdmin", "Custom"]), invoiceController.getInvoiceByClient);
// InvoiceInvoiceRouter.post("/getInvoiceByFirm", authorize("Read", "firm", ["Admin", "subAdmin", "Custom"]), invoiceController.getInvoiceByFirm);
// InvoiceInvoiceRouter.post("/listInvoiceNo", authorize("Create", "invoice", ["Admin", "subAdmin", "Custom"]), invoiceController.listInvoiceNo);
// InvoiceInvoiceRouter.post("/listInvoiceNumber",  invoiceController.listInvoiceNo);

/// patch routes

// InvoiceRouter.patch("/updateInvoice/:id", authorize("Update", "invoice", ["Admin", "subAdmin", "Custom"]), invoiceController.updateInvoice);
// InvoiceRouter.patch("/updateInvoiceforrecurringinvoice/:id", invoiceController.updateInvoice);
// InvoiceRouter.patch("/drafttoinvoice/:id", authorize("Update", "invoice", ["Admin", "subAdmin", "Custom"]), invoiceController.drafttoinvoice);
// InvoiceRouter.patch("/updateDraft/:id", authorize("Update", "invoice", ["Admin", "subAdmin", "Custom"]), invoiceController.updateDraftIn);
// InvoiceRouter.patch("/payment/:id", authorize("Update", "invoice", ["Admin", "subAdmin", "Custom"]), invoiceController.payment);
// InvoiceRouter.patch("/softDeleteInvoice/:id", authorize("Delete", "invoice", ["Admin", "subAdmin", "Custom"]), invoiceController.softDeleteInvoice);
// InvoiceRouter.patch("/restoreInvoice/:id", authorize("Delete", "invoice", ["Admin", "subAdmin", "Custom"]), invoiceController.restoreInvoice);
// InvoiceRouter.patch("/cancelInvoice/:id", authorize("Update", "invoice", ["Admin", "subAdmin", "Custom"]), invoiceController.cancelInvoice);
// InvoiceRouter.patch("/restoreCancelInvoice/:id", authorize("Update", "invoice", ["Admin", "subAdmin", "Custom"]), invoiceController.restoreCancelInvoice);

/// delete routes

// InvoiceRouter.delete("/deleteInvoice/:id", authorize("Update", "invoice", ["Admin", "subAdmin", "Custom"]), invoiceController.deleteInvoice);

/// not in use

// InvoiceRouter.get("/count", invoiceController.getTotalCount);
// InvoiceRouter.get("/user", invoiceController.getInvoicesByUser);
// InvoiceRouter.get("/totalsell", invoiceController.totalsell);

export default InvoiceRouter;
