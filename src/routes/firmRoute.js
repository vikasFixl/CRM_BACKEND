const express = require('express');
const router = express.Router();
const firmController = require('../controllers/firm');
const multer=require("multer")
const path=require("path")
const fs=require("fs")

const url = './public/firm/'
const storage = multer.diskStorage({
    destination:function (req, file, callback) {
        if (!fs.existsSync(url)) {
          fs.mkdirSync(url);
        }
        callback(null, url);
      },
    filename: (req, file, cb) => {
        cb(null,file.fieldname+'-'+Math.random()+Date.now()+path.extname(file.originalname))
    }
});

const upload = multer({
    storage:storage
});

router.post('/create',upload.single("logo"),firmController.createFirm);
router.get('/:id', firmController.getFirm);
router.patch('/update/:id', firmController.updateFirm);
router.delete('/delete/:id', firmController.deleteFirm);
router.get('/', firmController.getAllFirm);
router.patch('/insertlogo/:id',upload.single("logo"),firmController.logo);

module.exports = router; 