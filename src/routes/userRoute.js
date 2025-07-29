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
  enableSupportAccess,
  verifyOtp,
  sendVerificationOtp,
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




// ==================== Auth Routes ====================
Router.route("/signin").post(login);
Router.route("/signup").post(signup);
Router.route("/logout").post(logout);
Router.route("/refresh").post(isAuthenticated, refreshToken);

// ==================== Password Reset Routes ====================
Router.route("/forgot").post(forgotPassword);
Router.route("/reset").post(resetPassword);

// ==================== Verification Routes ====================
Router.route("/generate-otp").post(isAuthenticated,sendVerificationOtp);

Router.route("/verify").post(isAuthenticated,verifyOtp); // case-insensitive handling done in controller

// ==================== Security Routes ====================
Router.route("/generate-2fa-qr").post(isAuthenticated, generate2FAQr);
Router.route("/verify-2fa-setup").post(isAuthenticated, verify2FASetup);
Router.route("/verify-2fa-login").post(verify2FALogin);
Router.route("/send-login-otp").post(sendLoginOTP);
Router.route("/verify-login-otp").post(verifyLoginOTP);
Router.route("/enable-support-access").post(isAuthenticated, enableSupportAccess);

// ==================== User Profile Routes ====================
Router.route("/getprofile").get(isAuthenticated, getUser);
Router.route("/updateUser/:id").patch(isAuthenticated, isAdminOrSelf, updateUser);
Router.route("/updateProfilephoto").patch(isAuthenticated, updateProfileImage);

// ==================== Admin/User Actions ====================
Router.route("/delete/:id").delete(isAuthenticated, isAdminOrSelf, deleteUser); // soft delete for 30 days

export default Router;
