import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
// import { authorize } from "../middleweare/middleware.js";
import { AddUserToOrganization,createOrganization,  DeleteOrganizationUser,  getAllOrganizations, getOrganizationBYId, getUserOrganizations, switchOrg, UpdateOrganizationUser} from "../controllers/orgController.js";
import { isAuthenticated } from "../middleweare/middleware.js";
import { authenticateOrgToken } from "../middleweare/orgmiddleware.js";
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



// Router.route("/getOrgDeprt/:id").get(
//   // authorize("Read", "organization", ["Admin", "subAdmin", "Custom"]),
//   getOrgDeprt
// );



// Router.route("/logo/:id").patch(
//   // authorize("Update", "organization", ["Admin", "Custom"]),
//   // upload.single("orgLogo"),
//   Logo
// );


// get all org of user 
Router.route("/allOrg").get(isAuthenticated,getAllOrganizations);
// org by id 
Router.route("/getOrg/:orgId").get(isAuthenticated,authenticateOrgToken(["OrgAdmin"]),getOrganizationBYId);
// get user org
Router.route("/userOrg/:orgId").get(isAuthenticated,getUserOrganizations);
// create new org
Router.route("/addOrg").post(isAuthenticated,createOrganization);
// help to add userw
Router.route("/adduser").post(isAuthenticated,authenticateOrgToken(["OrgAdmin"]),AddUserToOrganization);
// provides access token based on org
Router.route("/switch").post(isAuthenticated,switchOrg);
Router.route("/updateuser/:id").put(isAuthenticated,authenticateOrgToken(["OrgAdmin"]),UpdateOrganizationUser);
Router.route("/deleteuser/:id").delete(isAuthenticated,authenticateOrgToken(["OrgAdmin"]),DeleteOrganizationUser);




export default Router;
