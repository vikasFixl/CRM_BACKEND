const express = require("express");
const router = express.Router();
const ReminderController = require("../controllers/ReminderController");

router.post("/createReminder", ReminderController.createReminder);

router.get("/getAllReminders", ReminderController.getAllReminders);

router.patch("/updateReminder", ReminderController.updateReminder);
router.patch("/deleteReminder", ReminderController.deleteReminder);

module.exports = router;
