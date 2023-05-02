const express = require("express");
const router = express.Router();
const vendorController = require("../controllers/vendorController");

router.get("/getAllVendor/:orgId", vendorController.getAllVendor);
router.get("/getVendorById/:id", vendorController.getVendorById);

router.post("/createVendor", vendorController.createVendor);
router.post("/getVendorByFirm", vendorController.getVendorByFirm);

router.patch("/updateVendor/:id", vendorController.updateVendor);
router.patch("/softDeleteVendor/:id", vendorController.softDeleteVendor);
router.patch("/restoreVendor/:id", vendorController.softDeleteVendor);

router.delete("/deleteVendor/:id", vendorController.deleteVendor);

module.exports = router;
