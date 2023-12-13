const express = require("express");
const router = express.Router();
const orgController = require("../controllers/orgController");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { authorize } = require("../middleweare/middleware");

const url = "./public/org/";
const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    if (!fs.existsSync(url)) {
      fs.mkdirSync(url);
    }
    callback(null, url);
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname +
      "-" +
      Math.random() +
      Date.now() +
      path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
});

router.get("/getData/:id", orgController.getOrgData);
router.get("/getOrgDeprt/:id", authorize("Read", "org", "organization", ["Admin", "subAdmin", "Custom"]), orgController.getOrgDeprt);

router.patch("/update/:id", authorize("Update", "org", "organization", ["Admin", "Custom"]), orgController.updateOrgData);
router.patch("/logo/:id", authorize("Update", "org", "organization", ["Admin", "Custom"]), upload.single("orgLogo"), orgController.logo);

router.post("/addOrg", upload.single("orgLogo"), orgController.addOrg);
router.post("/signin", orgController.signin);

module.exports = router;
