const express = require('express');
const router = express.Router();
const firmController = require('../controllers/firm');

router.post('/create', firmController.createFirm);
router.get('/:id', firmController.getFirm);
router.patch('/update/:id', firmController.updateFirm);
router.delete('/delete/:id', firmController.deleteFirm);
router.get('/', firmController.getAllFirm);

module.exports = router; 