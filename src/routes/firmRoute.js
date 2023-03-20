const express = require('express');
const router = express.Router();
const firmController = require('../controllers/firm');
const multer=require("multer")
const path=require("path")
const fs=require("fs")
const multerS3 = require('multer-s3');
const AWS = require('aws-sdk');


const s3 = new AWS.S3({
  accessKeyId: "AKIAXLHG4KUVTUGY2JWI",
  secretAccessKey: "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",
});

const storage=multerS3({
  s3: s3,
  bucket: 'crmfirmupload',
  key: (req, file, cb) => {
        cb(null,file.fieldname+'-'+Math.random()+Date.now()+path.extname(file.originalname))
    }
  });
const upload = multer({
    storage:storage
});

router.post('/create',firmController.createFirm);
router.get('/:id', firmController.getFirm);
router.patch('/update/:id', firmController.updateFirm);
router.delete('/delete/:id', firmController.deleteFirm);
router.get('/', firmController.getAllFirm);
router.patch('/insertlogo/:id',upload.single("logo"),firmController.logo);

module.exports = router; 