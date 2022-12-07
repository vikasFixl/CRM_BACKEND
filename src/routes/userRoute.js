const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.js");

router.post("/signin", userController.signin);
router.post("/signup", userController.signup);
router.post("/forgot", userController.forgotPassword);
router.post("/reset", userController.resetPassword);

module.exports = router;
