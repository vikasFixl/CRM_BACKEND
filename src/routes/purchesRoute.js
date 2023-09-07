const express = require("express");
const router = express.Router();
const invoiceController = require("../controllers/purches");

/// get routes

router.get("/drafts/:orgId", invoiceController.getDrafts);
router.get("/cancel/:orgId", invoiceController.getCancel);
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
router.post("/getSinglepurchase", invoiceController.getSingleInvoice);
router.post("/getpurchaseByClient", invoiceController.getInvoiceByClient);
router.post("/getpurchaseByFirm", invoiceController.getInvoiceByFirm);
router.post("/listpurchaseNo", invoiceController.listInvoiceNo);

/// patch routes

router.patch("/updatepurchase/:id", invoiceController.updateInvoice);
router.patch("/drafttopurchase/:id", invoiceController.drafttoinvoice);
router.patch("/updateDraft/:id", invoiceController.updateDraftIn);
router.patch("/payment/:id", invoiceController.payment);
router.patch("/softDeletepurchase/:id", invoiceController.softDeleteInvoice);
router.patch("/restorepurchase/:id", invoiceController.restoreInvoice);
router.patch("/cancelpurchase/:id", invoiceController.cancelInvoice);
router.patch(
  "/restoreCancelpurchase/:id",
  invoiceController.restoreCancelInvoice
);

/// delete routes

router.delete("/deletepurchase/:id", invoiceController.deleteInvoice);

/// not in use

router.get("/count", invoiceController.getTotalCount);
router.get("/user", invoiceController.getInvoicesByUser);
router.get("/getPurchasebyVender/:vender_id", invoiceController.getPurchasebyVender);

module.exports = router;
