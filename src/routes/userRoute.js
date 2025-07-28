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
  getUser,
  deleteUser,
  updateUser,
  logout,
  updateProfileImage,
} from "../controllers/user.js";

import { isAuthenticated, isAdminOrSelf } from "../middleweare/middleware.js";
import { authenticateOrgToken } from "../middleweare/orgmiddleware.js"
import { loginEmailRateLimiter, signupEmailRateLimiter, resetEmailRateLimiter, forgotEmailRateLimiter } from "../middleweare/ratelimitter.js";
import { generate2FAQr, refreshToken, sendLoginOTP, verify2FALogin, verify2FASetup, verifyLoginOTP } from "../controllers/authcontroller.js";




const Router = express.Router();







//  POST routes with rate limitter
// Router.route("/signin").post(loginEmailRateLimiter,login); // login user
// Router.route("/signup").post(signupEmailRateLimiter,signup); // signup user
// Router.route("/forgot").post(forgotEmailRateLimiter,forgotPassword);// forgot password

// Router.route("/reset").post(resetEmailRateLimiter,resetPassword); // reset password



//  POST routes without  rate limitter
Router.route("/signin").post(login); // login user
Router.route("/signup").post(signup); // signup user
Router.route("/forgot").post(forgotPassword);// forgot password

Router.route("/reset").post(resetPassword); // reset password
Router.route("/logout").post(logout); // logout

// GET routes

Router.route("/getprofile").get(isAuthenticated, getUser); // user profile


// DELETE route
Router.route("/delete/:id").delete(isAuthenticated, isAdminOrSelf, deleteUser); // delete user(admin or self) and soft delete for 30 days then automaticallydelete

// PATCH routes
Router.route("/updateUser/:id").patch(isAuthenticated, isAdminOrSelf, updateUser); // update user (admin or self)
Router.route("/updateProfilephoto/:id").patch(isAuthenticated, updateProfileImage); // update user profile photo
//
// Auth Routes
Router.route("/generate-2fa-qr").post(isAuthenticated, generate2FAQr); // generate 2fa qr code
Router.route("/verify-2fa-setup").post(isAuthenticated, verify2FASetup); // verify the 2fa setup
Router.route("/verify-2fa-login").post(verify2FALogin); // verify the 2fa login
Router.route("/send-login-otp").post(sendLoginOTP); // generate otp code for password less login
Router.route("/verify-login-otp").post(verifyLoginOTP); // verify login otp
Router.route("/refresh").post(isAuthenticated,refreshToken); // refresh token
export default Router;
