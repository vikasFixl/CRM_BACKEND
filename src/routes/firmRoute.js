const express = require('express');
const router = express.Router();
const firmController = require('../controllers/firm');
const upload=require("../routes/multer")

router.post('/create', firmController.createFirm);
router.get('/:id', firmController.getFirm);
router.patch('/update/:id', firmController.updateFirm);
router.delete('/delete/:id', firmController.deleteFirm);
router.get('/', firmController.getAllFirm);
router.patch('/insertlogo/:id',upload.single("logo"),firmController.logo);

module.exports = router; 