const express = require("express");
const router = express.Router();
const taxController = require("../controllers/taxRates");

router.post("/inserttaxRates", taxController.firsttaxrates);

router.get("/gettaxRates/:firmId", taxController.gettaxrates);
router.get("/getGlobalTaxs/:orgId", taxController.getGlobalTaxs);

router.patch("/updateRates/:id/:tid", taxController.updatetaxrates);
router.patch("/addtaxRate/:id", taxController.uaddtaxrates);

router.delete("/delete/:id/:oid", taxController.deletetaxRate);

module.exports = router;
