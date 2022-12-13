const express = require("express");
const router = express.Router();
const orgController = require('../controllers/orgController');

router.get("/getData/:id", orgController.getOrgData); 
router.get("/getOrgDeprt/:id", orgController.getOrgDeprt);
router.patch("/update/:id", orgController.updateOrgData);
router.post("/addOrg", orgController.addOrg);

module.exports = router;