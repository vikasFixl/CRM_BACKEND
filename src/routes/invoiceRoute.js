const express = require("express");
const router = express.Router();
const invoiceController = require("../controllers/invoices");

/// get routes

router.get("/drafts/:orgId", invoiceController.getDrafts);
router.get("/all/:orgId", invoiceController.getAllInvoices);
router.get("/singleInvoice/:orgId/:id", invoiceController.getInvoice);
router.get(
  "/getAllCancelInvoices/:orgId",
  invoiceController.getAllCancelInvoices
);
router.get(
  "/getAllDeletedInvoices/:orgId",
  invoiceController.getAllDeletedInvoices
);

/// post routes

router.post("/checkout-stripe", invoiceController.paymnetlink1);
router.post("/create", invoiceController.createInvoice);
router.post("/getSingleInvoice", invoiceController.getSingleInvoice);
router.post("/getInvoiceByClient", invoiceController.getInvoiceByClient);
router.post("/getInvoiceByFirm", invoiceController.getInvoiceByFirm);

/// patch routes

router.patch("/updateDraft/:id", invoiceController.updateDraftIn);
router.patch("/payment/:id", invoiceController.payment);
router.patch("/softDeleteInvoice/:id", invoiceController.softDeleteInvoice);
router.patch("/restoreInvoice/:id", invoiceController.restoreInvoice);
router.patch("/cancelInvoice/:id", invoiceController.cancelInvoice);
router.patch(
  "/restoreCancelInvoice/:id",
  invoiceController.restoreCancelInvoice
);

/// put routes

router.put("/status/:id", invoiceController.updateInvoice);

/// delete routes

router.delete("/deleteInvoice/:id", invoiceController.deleteInvoice);

/// not in use

router.get("/count", invoiceController.getTotalCount);
router.get("/user", invoiceController.getInvoicesByUser);

module.exports = router;
