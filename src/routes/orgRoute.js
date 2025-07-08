import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { checkPermission } from "../middleweare/orgmiddleware.js";
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


// get Oraganisation by id
Router.route("/").post(isAuthenticated, createOrganization);
Router.route("/:id").get(
  isAuthenticated,
  getOrganizationBYId
);
// return all organizations for a user
Router.route("/org/all").get(isAuthenticated, getUserOrganizations);
// return all users in an organization
Router.route("/users/all").get(
  isAuthenticated,
  authenticateOrgToken(),
  checkPermission("organization", "VIEW_ORG_USER"),
  getAllUserInOrg
);

// provides access token based on org
Router.route("/switch").post(isAuthenticated, switchOrg);
Router.route("/updateuser/:memberId").put(
  isAuthenticated,
  authenticateOrgToken(),
  checkPermission("organization", "UPDATE_ORG_USER"),

  UpdateOrganizationUser
);
Router.route("/deleteuser/:memberId").delete(
  isAuthenticated,
  authenticateOrgToken(),
  checkPermission("organization", "DELETE_ORG_USER"),

  DeleteOrganizationUser
);
Router.route("/createInvite").post(
  isAuthenticated,
  authenticateOrgToken(["OrgAdmin", "Manager"]),
  checkPermission("organization", "SEND_INVITATION"),

  CreateInvite
);
Router.route("/acceptInvite/:token").post(acceptInvite);
Router.route("/declineInvite/:token").post(declineInvite);
// Router.route("/declineInvite/:token").post(declineInvite);
Router.route("/all/Invite").get(
  isAuthenticated,
  authenticateOrgToken(),

  getOrganizationInvite
);

export default Router;
