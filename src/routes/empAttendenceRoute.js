const express = require("express");
const router = express.Router();
const attendenceController = require('../controllers/attendence');

//router.post('/createEmp',employeeController.createEmp);
router.post('/markAttendence/:eid',attendenceController.attendence);
router.patch('/markExit/:eid',attendenceController.markExit);
router.patch('/requestLeave/:eid',attendenceController.leave);
router.get('/getLeaves/:eid',attendenceController.getLeavesRecord);
router.get('/getAttendence/:eid',attendenceController.getAttendenceRecord);
router.get("/attendenceData",attendenceController.attendenceData);
router.patch("/authenicateLeaves/:eid",attendenceController.updateLeaves);

module.exports = router;