const express = require("express");
const router = express.Router();
const taxController = require('../controllers/taxRates');

router.post('/inserttaxRates/:Fid',taxController.firsttaxrates);
router.get('/gettaxRates/:Fid',taxController.gettaxrates);
router.patch('/updateRates/:id/:tid',taxController.updatetaxrates);
router.patch("/addtaxRate/:id",taxController.uaddtaxrates);
router.delete("/delete/:id/:oid",taxController.deletetaxRate);

module.exports=router
