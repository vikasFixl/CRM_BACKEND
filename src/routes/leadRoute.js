const express = require("express");
const router = express.Router();
const leadController = require("../controllers/leadController");

/* Lead By Org */

router.post("/getListByOrg", leadController.getListByOrg);
router.post("/getByStatusByOrg", leadController.getByStatusByOrg);

/* Lead By Firm */

router.post("/getListByFirm", leadController.getListByFirm);
router.post("/getByStatusByFirm", leadController.getByStatusByFirm);

/* Comman API's */

router.get("/leadById/:id", leadController.leadById);

router.post("/add-lead", leadController.addLead);
router.post("/leadSearch", leadController.leadSearch);

router.patch("/update-lead/:id", leadController.updateLead);

module.exports = router