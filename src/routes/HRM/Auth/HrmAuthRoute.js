import express from "express";
import {
  HrmLogin,
//   HrmSelectOrg,
//   refreshHrmToken,
//   HrmLogout
} from "../../../controllers/NHRM/HrmAuth/hrmauthcontroller.js";

const HRMAUTH = express.Router();

/**
 * HRM AUTH ROUTES
 */

// Login with email + password
HRMAUTH.post("/login", HrmLogin);

// // Select organization (multi-org users)
// HRMAUTH.post("/select-org", HrmSelectOrg);

// // Refresh HRM access token
// HRMAUTH.post("/refresh", refreshHrmToken);

// // Logout HRM (clear cookies)
// HRMAUTH.post("/logout", HrmLogout);

export default HRMAUTH;