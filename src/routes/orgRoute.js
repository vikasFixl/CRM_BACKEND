const express = require("express");
const router = express.Router();
const orgController = require('../controllers/orgController');
const multer=require("multer")
const path=require("path")
const fs=require("fs")

const url = './public/org/'
const storage = multer.diskStorage({
    destination:function (req, file, callback) {
        if (!fs.existsSync(url)) {
          fs.mkdirSync(url);
        }
        callback(null, url);
      },
    filename: (req, file, cb) => {
        cb(null,file.fieldname+'-'+Math.random()+Date.now()+path.extname(file.originalname))
    }
});

const upload = multer({
    storage:storage
});

router.get("/getData/:id", orgController.getOrgData); 
router.get("/getOrgDeprt/:id", orgController.getOrgDeprt);
router.patch("/update/:id", orgController.updateOrgData);
router.post("/addOrg",upload.single("orgLogo"),orgController.addOrg);
router.post("/signin",orgController.signin);
router.patch("/logo/:id",upload.single("orgLogo"),orgController.logo);
module.exports = router;