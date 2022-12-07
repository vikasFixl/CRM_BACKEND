const express = require("express");
const router = express.Router();
const searchController = require("../controllers/search");

router.post("/", searchController.getResult);

module.exports = router;