const express = require("express");
const router = express.Router();
const employeeController = require("../controllers/employee");

router.get("/empGet/:orgId", employeeController.empGet);

router.post("/empCreate", employeeController.create);

router.patch("/empUpdate/:id", employeeController.empUpdate);

module.exports = router;
