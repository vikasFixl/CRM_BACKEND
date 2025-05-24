import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
// import { authorize } from "../middleweare/middleware.js";
import { AddUserToOrganization,createOrganization,  getAllOrganizations, getUserOrganizations, switchOrg} from "../controllers/orgController.js";
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

// Define routes using Router.route().method chaining

// Router.route("/getData/:id").get(getOrgData);

// Router.route("/getOrgDeprt/:id").get(
//   // authorize("Read", "organization", ["Admin", "subAdmin", "Custom"]),
//   getOrgDeprt
// );

// Router.route("/update/:id").patch(
//   // authorize("Update", "organization", ["Admin", "Custom"]),
//   updateOrgData
// );

// Router.route("/logo/:id").patch(
//   // authorize("Update", "organization", ["Admin", "Custom"]),
//   // upload.single("orgLogo"),
//   Logo
// );
Router.route("/allOrg").get(isAuthenticated,getAllOrganizations);
Router.route("/userOrg/:orgId").get(isAuthenticated,getUserOrganizations);
Router.route("/addOrg").post(isAuthenticated,createOrganization);
Router.route("/adduser").post(isAuthenticated,authenticateOrgToken(["OrgAdmin"]),AddUserToOrganization);
Router.route("/switch").post(isAuthenticated,switchOrg);


// Router.route("/signin").post(signin);

export default Router;
