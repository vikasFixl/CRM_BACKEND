const express = require("express");
const router = express.Router();
const invoiceController = require("../controllers/invoices");

/// get routes

router.get('/draftById/:id', invoiceController.getDraftByid);
router.get("/drafts/:orgId", invoiceController.getDrafts);
router.get("/all/:orgId", invoiceController.getAllInvoices);
router.get("/singleInvoice/:orgId/:id", invoiceController.getInvoice);
router.get("/getdrafts/:orgId",invoiceController.getDrafts);

/// post routes

router.post('/checkout-stripe',invoiceController.paymnetlink1);
router.post("/create", invoiceController.createInvoice);
router.post("/getSingleInvoice", invoiceController.getSingleInvoice);

/// patch routes

router.patch('/updateDraft/:id', invoiceController.updateDraftIn);
router.patch('/payment/:id', invoiceController.payment);

/// put routes
router.put("/status/:id", invoiceController.updateInvoice);

/// not in use

router.get("/count", invoiceController.getTotalCount);
router.get("/user", invoiceController.getInvoicesByUser);

module.exports = router;
