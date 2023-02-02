const express = require("express");
const router = express.Router();
const salController = require('../controllers/salary');

router.post('/postSaldetails/:eid',salController.postSaldetails);
router.get("/paySh/:eid",salController.paySlipgen);

module.exports = router;