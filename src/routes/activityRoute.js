const express = require("express");
const activityController = require("../controllers/activityController");
const router = express.Router();

router.get("/:module", activityController.getRecenteActivities);
router.get("/:module/:entityId", activityController.getEntityRecenteActivities);
router.get("/userActivity/getUserActivity/:id", activityController.getUserActivity);

router.post("/add", activityController.createActivities);

module.exports = router;
