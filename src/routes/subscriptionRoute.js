
const express = require("express");
const router = express.Router();
const Subscription =require("../controllers/subscription")

router.post("/createsubscription",Subscription.createSubscription)
router.get("/getAllSubscription",Subscription.getAllSubscription)

module.exports =router