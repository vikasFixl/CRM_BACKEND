const express = require("express");
const router = express.Router();
const LeadActivityController = require("../controllers/leadActivityController");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

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

router.get("/getAllActivities/:leadId", LeadActivityController.getLeadActivity);
router.get(
  "/getActivitiesByType/:type/:leadId",
  LeadActivityController.getActivityByType
);
router.get("/getLeadActivityById/:id", LeadActivityController.getbyId);

router.get(
  "/getLeadActivityComment/:id",
  LeadActivityController.getLeadActivityComment
);

router.post(
  "/addLeadActivity",
  upload.single("image"),
  LeadActivityController.createLeadActivity
);

router.post(
  "/addLeadActivityComment",
  LeadActivityController.addLeadActivityComment
);
router.patch(
  "/updateLeadActivityComment",
  LeadActivityController.updateLeadActivityComment
);
router.delete(
  "/deleteLeadActivityComment/:id",
  LeadActivityController.deleteLeadActivityComment
);

router.patch(
  "/updateLeadActivity/:id",
  LeadActivityController.updateLeadActivity
);
router.patch(
  "/updateAttachment/:id",
  upload.single("image"),
  LeadActivityController.updateAttachment
);

router.delete(
  "/deleteLeadActivity/:id",
  LeadActivityController.deleteLeadActivity
);

module.exports = router;
