const express = require("express");
const router = express.Router();
const LeadActivityController = require("../controllers/leadActivityController");

router.get("/getAllActivities/:LId", LeadActivityController.getLeadActivity)
router.get("/getActivitiesByType/:type/:LId", LeadActivityController.getActivityByType)

router.post("/addLeadActivity", LeadActivityController.createLeadActivity)

router.patch("/updateLeadActivity/:id", LeadActivityController.updateLeadActivity)

router.delete("/deleteLeadActivity/:id", LeadActivityController.deleteLeadActivity)

module.exports = router;
