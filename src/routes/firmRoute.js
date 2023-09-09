const express = require('express');
const router = express.Router();
const firmController = require('../controllers/firm');
const multer=require("multer")
const path=require("path")
const fs=require("fs")
const multerS3 = require('multer-s3');
const AWS = require('aws-sdk');
const { authorize } = require('../middleweare/middleware');


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

router.post('/create', authorize("Create", "firm", ["Admin", "subAdmin", "Purchase", "Custom"]), firmController.createFirm);

router.delete('/delete/:id', firmController.deleteFirm);

router.get('/getFirm/:orgId/:id', firmController.getFirm);
router.get('/getAllFirm/:orgId', firmController.getAllFirm);
router.get('/getFirmList/:orgId', firmController.getFirmList);

router.patch('/update/:id', firmController.updateFirm);
router.patch('/insertlogo/:id',upload.single("logo"),firmController.logo);

module.exports = router; 