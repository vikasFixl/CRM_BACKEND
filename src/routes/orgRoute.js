import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
// import { authorize } from "../middleweare/middleware.js";
import {
  acceptInvite,
  // AddUserToOrganization,
  CreateInvite,
  createOrganization,
  declineInvite,
  DeleteOrganizationUser,
  getAllUserInOrg,
  // getAllOrganizations,
  getOrganizationBYId,
  getOrganizationInvite,
  getUserOrganizations,
  switchOrg,
  UpdateOrganizationUser,
} from "../controllers/orgController.js";
import { isAuthenticated } from "../middleweare/middleware.js";
import { authenticateOrgToken } from "../middleweare/orgmiddleware.js";
import {
  lightLimiter,
  moderateLimiter,
  moderatePlusLimiter,
} from "../middleweare/ratelimitter.js";
const Router = express.Router();

const url = "./public/org/";

const storage = multer.diskStorage({
  destination(req, file, cb) {
    if (!fs.existsSync(url)) {
      fs.mkdirSync(url, { recursive: true });
    }
    cb(null, url);
  },
  filename(req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Math.random()}${Date.now()}${path.extname(
        file.originalname
      )}`
    );
  },
});

const upload = multer({ storage });

// routres with rate limiter
/**
 * 
Router.route("/").post(isAuthenticated, moderateLimiter, createOrganization); // rate limiter route
Router.route("/switch").post(isAuthenticated, moderatePlusLimiter, switchOrg); // rate limiter route
Router.route("/updateuser/:id").put(
  isAuthenticated,
  authenticateOrgToken(["OrgAdmin"]),
  moderateLimiter,
  UpdateOrganizationUser
);
Router.route("/deleteuser/:id").delete(
  isAuthenticated,
  authenticateOrgToken(["OrgAdmin"]),
  moderateLimiter,
  DeleteOrganizationUser
);
Router.route("/createInvite").post(
  isAuthenticated,
  authenticateOrgToken(["OrgAdmin", "Manager"]),
  moderatePlusLimiter,
  CreateInvite
);
Router.route("/acceptInvite/:token").post(lightLimiter, acceptInvite);
Router.route("/declineInvite/:token").post(lightLimiter, declineInvite);
*/

// Add a new user to organization
// Router.route("/adduser").post(
//   isAuthenticated,
//   authenticateOrgToken(["OrgAdmin"]),
//   AddUserToOrganization
// );
// get Oraganisation by id
Router.route("/").post(isAuthenticated, createOrganization);
Router.route("/:id").get(
  isAuthenticated,
  authenticateOrgToken(["OrgAdmin"]),
  getOrganizationBYId
);
// get user org where user is in
Router.route("/user/all").get(isAuthenticated, getUserOrganizations);
Router.route("/org/users").get(isAuthenticated,authenticateOrgToken(["OrgAdmin"]), getAllUserInOrg);

// provides access token based on org
Router.route("/switch").post(isAuthenticated, switchOrg);
Router.route("/updateuser/:id").put(
  isAuthenticated,
  authenticateOrgToken(["OrgAdmin"]),

  UpdateOrganizationUser
);
Router.route("/deleteuser/:id").delete(
  isAuthenticated,
  authenticateOrgToken(["OrgAdmin"]),

  DeleteOrganizationUser
);
Router.route("/createInvite").post(
  isAuthenticated,
  authenticateOrgToken(["OrgAdmin", "Manager"]),

  CreateInvite
);
Router.route("/acceptInvite/:token").post(acceptInvite);
Router.route("/declineInvite/:token").post(declineInvite);
// Router.route("/declineInvite/:token").post(declineInvite);
Router.route("/all/Invite").get(
  isAuthenticated,
  authenticateOrgToken(["OrgAdmin"]),
  getOrganizationInvite
);

export default Router;
