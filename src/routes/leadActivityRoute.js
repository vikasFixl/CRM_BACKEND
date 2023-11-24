const express = require("express");
const router = express.Router();
const LeadActivityController = require("../controllers/leadActivityController");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { authorize } = require("../middleweare/middleware");

const url = "./public/activity/";
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

router.get("/getAllActivities/:leadId", authorize("Read", "lead", ["Admin", "subAdmin", "Custom"]), LeadActivityController.getLeadActivity);
router.get("/getActivitiesByType/:type/:leadId", authorize("Read", "lead", ["Admin", "subAdmin", "Custom"]), LeadActivityController.getActivityByType);
router.get("/getLeadActivityById/:id", authorize("Read", "lead", ["Admin", "subAdmin", "Custom"]), LeadActivityController.getbyId);
router.get("/getLeadActivityComment/:id", authorize("Read", "lead", ["Admin", "subAdmin", "Custom"]), LeadActivityController.getLeadActivityComment);

router.post("/addLeadActivity", authorize("Create", "lead", ["Admin", "subAdmin", "Custom"]), upload.single("image"), LeadActivityController.createLeadActivity);
router.post("/addLeadActivityComment", authorize("Create", "lead", ["Admin", "subAdmin", "Custom"]), LeadActivityController.addLeadActivityComment);
router.patch("/updateLeadActivityComment", authorize("Update", "lead", ["Admin", "subAdmin", "Custom"]), LeadActivityController.updateLeadActivityComment);

router.patch("/updateLeadActivity/:id", authorize("Update", "lead", ["Admin", "subAdmin", "Custom"]), LeadActivityController.updateLeadActivity);
router.patch("/updateAttachment/:id", authorize("Update", "lead", ["Admin", "subAdmin", "Custom"]), upload.single("image"), LeadActivityController.updateAttachment);

router.delete("/deleteLeadActivityComment/:id", authorize("Delete", "lead", ["Admin", "Custom"]), LeadActivityController.deleteLeadActivityComment);
router.delete("/deleteLeadActivity/:id", authorize("Delete", "lead", ["Admin", "Custom"]), LeadActivityController.deleteLeadActivity);

module.exports = router;
