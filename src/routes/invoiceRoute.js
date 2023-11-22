const express = require("express");
const router = express.Router();
const invoiceController = require("../controllers/invoices");
const { authorize } = require("../middleweare/middleware");

/// get routes

router.get("/drafts/:orgId", authorize('Read', 'invoice', ['Admin', 'subAdmin', 'Custom']), invoiceController.getDrafts);
router.get("/cancel/:orgId", authorize('Read', 'invoice', ['Admin', 'subAdmin', 'Custom']), invoiceController.getCancel);
router.get("/all/:orgId", authorize('Read', 'invoice', ['Admin', 'subAdmin', 'Custom']), invoiceController.getAllInvoices);
router.get("/singleInvoice/:orgId/:id", authorize('Read', 'invoice', ['Admin', 'subAdmin', 'Custom']), invoiceController.getInvoice);
router.get("/getAllCancelInvoices/:orgId", authorize('Read', 'invoice', ['Admin', 'subAdmin', 'Custom']), invoiceController.getAllCancelInvoices);
router.get("/getAllDeletedInvoices/:orgId", authorize('Read', 'invoice', ['Admin', 'subAdmin', 'Custom']), invoiceController.getAllDeletedInvoices);

/// post routes

router.post("/checkout-stripe", invoiceController.paymnetlink1);
router.post("/create", authorize("Create", "invoice", ["Admin", "subAdmin", "Custom"]), invoiceController.createInvoice);
router.post("/getSingleInvoice", invoiceController.getSingleInvoice);
router.post("/getInvoiceByClient", authorize("Read", "client", ["Admin", "subAdmin", "Custom"]), invoiceController.getInvoiceByClient);
router.post("/getInvoiceByFirm", authorize("Read", "firm", ["Admin", "subAdmin", "Custom"]), invoiceController.getInvoiceByFirm);
router.post("/listInvoiceNo", authorize("Create", "invoice", ["Admin", "subAdmin", "Custom"]), invoiceController.listInvoiceNo);

/// patch routes

router.patch("/updateInvoice/:id", authorize("Update", "invoice", ["Admin", "subAdmin", "Custom"]), invoiceController.updateInvoice);
router.patch("/drafttoinvoice/:id", authorize("Update", "invoice", ["Admin", "subAdmin", "Custom"]), invoiceController.drafttoinvoice);
router.patch("/updateDraft/:id", authorize("Update", "invoice", ["Admin", "subAdmin", "Custom"]), invoiceController.updateDraftIn);
router.patch("/payment/:id", authorize("Update", "invoice", ["Admin", "subAdmin", "Custom"]), invoiceController.payment);
router.patch("/softDeleteInvoice/:id", authorize("Delete", "invoice", ["Admin", "subAdmin", "Custom"]), invoiceController.softDeleteInvoice);
router.patch("/restoreInvoice/:id", authorize("Delete", "invoice", ["Admin", "subAdmin", "Custom"]), invoiceController.restoreInvoice);
router.patch("/cancelInvoice/:id", authorize("Update", "invoice", ["Admin", "subAdmin", "Custom"]), invoiceController.cancelInvoice);
router.patch("/restoreCancelInvoice/:id", authorize("Update", "invoice", ["Admin", "subAdmin", "Custom"]), invoiceController.restoreCancelInvoice);

/// delete routes

router.delete("/deleteInvoice/:id", authorize("Update", "invoice", ["Admin", "subAdmin", "Custom"]), invoiceController.deleteInvoice);

/// not in use

router.get("/count", invoiceController.getTotalCount);
router.get("/user", invoiceController.getInvoicesByUser);
router.get("/totalsell", invoiceController.totalsell);

module.exports = router;
