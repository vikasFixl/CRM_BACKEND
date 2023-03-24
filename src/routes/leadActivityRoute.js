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

router.get("/getAllActivities/:orgId/:LId", LeadActivityController.getLeadActivity);
router.get(
  "/getActivitiesByType/:orgId/:type/:LId",
  LeadActivityController.getActivityByType
);
router.get("/getLeadActivityById/:LId/:id", LeadActivityController.getbyId);

router.post(
  "/addLeadActivity",
  upload.single("image"),
  LeadActivityController.createLeadActivity
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
