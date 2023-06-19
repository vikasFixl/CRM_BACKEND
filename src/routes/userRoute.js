const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.js");
const multer=require("multer")
const path=require("path")
const fs=require("fs")

const url = './public/user/'
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

router.post("/signin", userController.signin);
router.post("/signup",upload.single("profilePhoto"),userController.signup);
router.post("/forgot", userController.forgotPassword);
router.post("/reset", userController.resetPassword);
router.post('/getUsersByDept',userController.getUsersByDept);

router.get('/getUser/:id',userController.getUser);
router.get('/getAllusers/:orgId',userController.getAllusers);

router.delete('/delete/:id',userController.delete);

router.patch('/updateUser/:id',userController.updateUser);
router.patch('/updateProfilephoto/:id',upload.single("profilePhoto"),userController.updateProfileimage)

module.exports = router;
