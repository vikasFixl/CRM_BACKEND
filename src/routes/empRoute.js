const express = require("express");
const router = express.Router();
const employeeController = require("../controllers/employee");

router.get("/emp", employeeController.emp);

module.exports = router;
