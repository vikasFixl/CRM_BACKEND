const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.js");

router.post("/signin", userController.signin);
router.post("/signup", userController.signup);
router.post("/forgot", userController.forgotPassword);
router.post("/reset", userController.resetPassword);
router.get('/:id',userController.getUser);
router.get('/',userController.getAllusers);
router.delete('/delete/:id',userController.delete);
router.patch('/updateUser/:id',userController.updateUser);

module.exports = router;
