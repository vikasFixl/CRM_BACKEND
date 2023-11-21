const express = require("express");
const router = express.Router();
const vendorController = require("../controllers/vendorController");
const { authorize } = require("../middleweare/middleware");

router.get("/getAllVendor/:orgId", authorize('Read', 'vendor', ['Admin', 'subAdmin', 'Custom']), vendorController.getAllVendor);
router.get("/getVendorById/:id", vendorController.getVendorById);

router.post("/createVendor", authorize('Create', 'vendor', ['Admin', 'subAdmin', 'Custom']), vendorController.createVendor);
router.post("/getVendorByFirm", vendorController.getVendorByFirm);

router.patch("/updateVendor/:id", authorize('Update', 'vendor', ['Admin', 'subAdmin', 'Custom']), vendorController.updateVendor);
router.patch("/softDeleteVendor/:id", vendorController.softDeleteVendor);
router.patch("/restoreVendor/:id", vendorController.softDeleteVendor);

router.delete("/deleteVendor/:id", authorize('Delete', 'vendor', ['Admin', 'Custom']), vendorController.deleteVendor);

module.exports = router;
