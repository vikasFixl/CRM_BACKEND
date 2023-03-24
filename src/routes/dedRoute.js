const express = require("express");
const router = express.Router();
const dedController = require("../controllers/deduction");

router.post("/postDeductionDetails/:eid", dedController.postDedDetails);

module.exports = router;
