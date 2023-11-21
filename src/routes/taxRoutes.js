const express = require("express");
const router = express.Router();
const taxController = require("../controllers/taxRates");
const { authorize } = require("../middleweare/middleware");

router.post("/postGlobalTax", taxController.postGlobalTax);
router.post("/addTaxInFirm", taxController.addTaxInFirm);
router.post("/clientByTax", taxController.clientByTax);
router.post("/invoiceByTax", taxController.invoiceByTax);

router.get("/gettaxRates/:firmId", authorize('Read', 'invoice', ['Admin', 'subAdmin', 'Custom']), taxController.gettaxrates);
router.get("/getGlobalTaxs/:orgId", authorize('Read', 'invoice', ['Admin', 'subAdmin', 'Custom']), taxController.getGlobalTaxs);
router.get("/getAllTaxes/:orgId", authorize('Read', 'invoice', ['Admin', 'subAdmin', 'Custom']), taxController.getAllTaxes);

router.patch("/updateRates/:id", taxController.updatetaxrates);

router.delete("/delete/:id/:oid", taxController.deletetaxRate);

module.exports = router;
