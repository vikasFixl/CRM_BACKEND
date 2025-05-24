// userRoute.js

import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import {
  login,
  signup,
  forgotPassword,
  resetPassword,
  email,
  getUsersByDept,
  updateProfileimage,
  getUserList,
  getUser,
  getAllusers,
  deleteUser,
  updateUser,
  logout,
} from "../controllers/user.js";

import { isAuthenticated } from "../middleweare/middleware.js";

// Directory setup for ES module (__dirname alternative)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const uploadDir = path.join(__dirname, "../../public/user/");

const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    callback(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Math.random() + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// User Routes (only active module)
router.post("/signin", login);
router.post("/signup", upload.single("profilePhoto"), signup);
router.post("/forgot",forgotPassword);
router.post("/invitation", email);
router.post("/reset", resetPassword);
router.post("/getUsersByDept", getUsersByDept);
router.post("/logout",logout);

router.get("/getUser/:id", isAuthenticated,getUser);
router.get("/getAllusers/:orgId", getAllusers);
router.get("/getUserList", getUserList);

router.delete("/delete/:id", deleteUser);

router.patch("/updateUser/:id", isAuthenticated, updateUser);
router.patch("/updateProfilephoto/:id", upload.single("profilePhoto"),updateProfileimage);

export default router;
