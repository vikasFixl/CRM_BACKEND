const express = require("express");
const router = express.Router();
const taxController = require("../controllers/taxRates");

router.post("/postGlobalTax", taxController.postGlobalTax);
router.post("/addTaxInFirm", taxController.addTaxInFirm);
router.post("/clientByTax", taxController.clientByTax);
router.post("/invoiceByTax", taxController.invoiceByTax);

router.get("/gettaxRates/:firmId", taxController.gettaxrates);
router.get("/getGlobalTaxs/:orgId", taxController.getGlobalTaxs);
router.get("/getAllTaxes/:orgId", taxController.getAllTaxes);

router.patch("/updateRates/:id", taxController.updatetaxrates);

router.delete("/delete/:id/:oid", taxController.deletetaxRate);

module.exports = router;
