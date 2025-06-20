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
  
  getUser,
  // getAllusers,
  deleteUser,
  updateUser,
  logout,
  updateProfileImage,
} from "../controllers/user.js";

import { isAuthenticated, isAdminOrSelf } from "../middleweare/middleware.js";
import {authenticateOrgToken} from "../middleweare/orgmiddleware.js"
import { loginEmailRateLimiter, signupEmailRateLimiter,resetEmailRateLimiter,forgotEmailRateLimiter } from "../middleweare/ratelimitter.js";




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
// Router.route("/getAllusers/:orgId").get(isAuthenticated,authenticateOrgToken(["OrgAdmin"]),getAllusers); // get all org users
// Router.route("/getUserList").get(getUserList); // admin route to view all users

// DELETE route
Router.route("/delete/:id").delete(isAuthenticated,isAdminOrSelf,deleteUser); // delete user(admin or self) and soft delete for 30 days then automaticallydelete

// PATCH routes
Router.route("/updateUser/:id").patch(isAuthenticated,isAdminOrSelf,updateUser); // update user (admin or self)
Router.route("/updateProfilephoto/:id").patch(isAuthenticated,updateProfileImage); // update user profile photo

export default Router;
