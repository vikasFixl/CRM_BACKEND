const express = require("express");
const router = express.Router();
const taxController = require("../controllers/taxRates");

router.post("/postGlobalTax", taxController.postGlobalTax);
router.post("/addTaxInFirm", taxController.addTaxInFirm);

router.get("/gettaxRates/:firmId", taxController.gettaxrates);
router.get("/getGlobalTaxs/:orgId", taxController.getGlobalTaxs);

router.patch("/updateRates/:id", taxController.updatetaxrates);

router.delete("/delete/:id/:oid", taxController.deletetaxRate);

module.exports = router;
