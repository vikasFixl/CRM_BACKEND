import express from "express";
import {
  suspendUser,
  unsuspendUser,
  suspendOrganization,
  unsuspendOrganization,
} from "../../controllers/superAdmin/Authcontroller.js"; // adjust path as needed

const AdminAuth = express.Router();

// ===================== USER SUSPENSION =====================
AdminAuth.post("/user/:userId/suspend", suspendUser);
AdminAuth.post("/user/:userId/unsuspend", unsuspendUser);

// ===================== ORGANIZATION SUSPENSION =====================
AdminAuth.post("/organization/:orgId/suspend", suspendOrganization);
AdminAuth.post("/organization/:orgId/unsuspend", unsuspendOrganization);

export default AdminAuth;
