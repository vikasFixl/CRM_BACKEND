const express = require("express");
const router = express.Router();
const leadController = require("../controllers/leadController");

router.get("/list", leadController.getList);
router.get("/deleted-list", leadController.getDeletedList);
router.get("/leadById/:id", leadController.leadById);
router.post("/leadSearch", leadController.leadSearch);
router.get("/leadByStatus/:status", leadController.getByStatus);
router.post("/add-lead", leadController.addLead);
router.patch("/update-lead/:id", leadController.updateLead);
router.patch("/status-lead/:id/:status", leadController.statusLead);
router.patch("/stage-lead/:id/:stage", leadController.stageLead);
router.patch("/delete-lead/:id", leadController.deleteLead);
router.patch("/transferlead/:id",leadController.transferLead);

module.exports = router