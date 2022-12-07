const express = require("express");
const router = express.Router();
const invoiceController = require("../controllers/invoices");

router.post("/create", invoiceController.createInvoice);
router.get("/singleInvoice/:id", invoiceController.getInvoice);
router.put("/status/:id", invoiceController.updateInvoice);
router.put("/delete/:id", invoiceController.deleteInvoice);
router.get("/count", invoiceController.getTotalCount);
router.get("/user", invoiceController.getInvoicesByUser);
router.get("/all", invoiceController.getAllInvoices);

module.exports = router;