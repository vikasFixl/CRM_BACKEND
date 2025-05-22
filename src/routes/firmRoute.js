const express = require('express');
const router = express.Router();
const firmController = require('../controllers/firm');
const multer = require("multer")
const path = require("path")
const fs = require("fs")
const multerS3 = require('multer-s3');
const AWS = require("@aws-sdk/client-s3");
const { authorize } = require('../middleweare/middleware');


const s3 = new AWS.S3({
  accessKeyId: "AKIAXLHG4KUVTUGY2JWI",
  secretAccessKey: "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",
});

const storage = multerS3({
  s3: s3,
  bucket: 'crmfirmupload',
  key: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Math.random() + Date.now() + path.extname(file.originalname))
  }
});
const upload = multer({
  storage: storage
});

router.post('/create', authorize("Create", "firm", ["Admin", "subAdmin", "Custom"]), firmController.createFirm);

router.delete('/delete/:id', authorize("Delete", "firm", ["Admin", "Custom"]), firmController.deleteFirm);
router.get('/getFirm/:orgId/:id', authorize("Read", "firm", ["Admin", "subAdmin", "Custom"]), firmController.getFirm);
router.get('/getFirmforinvoicerecurring/:orgId/:id', firmController.getFirm);
router.get('/getAllFirm/:orgId', authorize("Read", "firm", ["Admin", "subAdmin", "Custom"]), firmController.getAllFirm);
router.get('/getFirmList/:orgId', authorize("Read", "firm", ["Admin", "subAdmin", "Custom"]), firmController.getFirmList);

router.patch('/update/:id', authorize("Update", "firm", ["Admin", "subAdmin", "Custom"]), firmController.updateFirm);
router.patch('/insertlogo/:id', authorize("Update", "firm", ["Admin", "subAdmin", "Custom"]), upload.single("logo"), firmController.logo);

module.exports = router; 