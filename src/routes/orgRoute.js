const express = require("express");
const router = express.Router();
const orgController = require('../controllers/orgController');
const upload=require('../routes/multer')

router.get("/getData/:id", orgController.getOrgData); 
router.get("/getOrgDeprt/:id", orgController.getOrgDeprt);
router.patch("/update/:id", orgController.updateOrgData);
router.post("/addOrg", orgController.addOrg);
router.post("/signin",orgController.signin);
router.patch("/logo/:id",upload.single("orgLogo"),orgController.logo);
module.exports = router;