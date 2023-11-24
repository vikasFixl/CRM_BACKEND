const express = require("express");
const router = express.Router();
const leadController = require("../controllers/leadController");
const { authorize } = require("../middleweare/middleware");

/* Lead By Org */

router.post("/getListByOrg", authorize("Read", "lead", ["Admin", "subAdmin", "Custom"]), leadController.getListByOrg);
router.post("/getByStatusByOrg", authorize("Read", "lead", ["Admin", "subAdmin", "Custom"]), leadController.getByStatusByOrg);

/* Lead By Firm */

router.post("/getListByFirm", leadController.getListByFirm);
router.post("/getByStatusByFirm", leadController.getByStatusByFirm);

/* Comman API's */

router.get("/leadById/:id", authorize("Read", "lead", ["Admin", "subAdmin", "Custom"]), leadController.leadById);

router.post("/add-lead", authorize("Create", "lead", ["Admin", "subAdmin", "Custom"]), leadController.addLead);
router.post("/add-leadbyExcel", authorize("Create", "lead", ["Admin", "subAdmin", "Custom"]), leadController.addLeadByExcel);
router.post("/leadSearch", authorize("Read", "lead", ["Admin", "subAdmin", "Custom"]), leadController.leadSearch);

router.patch("/update-lead/:id", authorize("Update", "lead", ["Admin", "subAdmin", "Custom"]), leadController.updateLead);
router.post("/bulkDelete", authorize("Delete", "lead", ["Admin", "Custom"]), leadController.bulkDelete);

module.exports = router