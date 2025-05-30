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

  // getUsersByDept,
  // getUserList,
  updateProfileimage,
  getUser,
  getAllusers,
  deleteUser,
  updateUser,
  logout,
} from "../controllers/user.js";

import { isAuthenticated, isAdminOrSelf } from "../middleweare/middleware.js";
import {authenticateOrgToken} from "../middleweare/orgmiddleware.js"
import { loginEmailRateLimiter, signupEmailRateLimiter,resetEmailRateLimiter,forgotEmailRateLimiter } from "../middleweare/ratelimitter.js";

// Directory setup for ES module (__dirname alternative)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const Router = express.Router();


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

// POST routes
Router.route("/signin").post(loginEmailRateLimiter,login); // login user
Router.route("/signup").post(signupEmailRateLimiter,signup); // signup user
Router.route("/forgot").post(forgotEmailRateLimiter,forgotPassword);// forgot password

Router.route("/reset").post(resetEmailRateLimiter,resetPassword); // reset password
Router.route("/logout").post(logout); // logout

// GET routes

Router.route("/getprofile").get(isAuthenticated, getUser); // user profile
Router.route("/getAllusers/:orgId").get(isAuthenticated,authenticateOrgToken(["OrgAdmin"]),getAllusers); // get all org users
// Router.route("/getUserList").get(getUserList); // admin route to view all users

// DELETE route
Router.route("/delete/:id").delete(isAuthenticated,isAdminOrSelf,deleteUser); // delete user(admin or self) and soft delete for 30 days then automaticallydelete

// PATCH routes
Router.route("/updateUser/:id").patch(isAuthenticated,isAdminOrSelf,updateUser); // update user (admin or self)
Router.route("/updateProfilephoto/:id").patch(isAuthenticated, updateProfileimage); // update user profile photo

export default Router;
