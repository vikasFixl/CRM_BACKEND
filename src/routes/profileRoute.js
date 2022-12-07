const express = require("express");
const router = express.Router();
const profileController = require('../controllers/profile');

router.get("/:id", profileController.getProfile);
// router.get('/profile', getProfiles)
router.get("/user", profileController.getProfilesByUser);
router.post("/create", profileController.createProfile);
router.patch("/update/:id", profileController.updateProfile);
router.delete("/delete/:id", profileController.deleteProfile);

module.exports = router;