import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import path from "path";
import { OrgMember } from "../models/OrganisationMemberSchema.js";
dotenv.config({ path: "../../.env" });

const ORGSECRET = process.env.ORG_SECRET;

export const authenticateOrgToken = () => {
  return (req, res, next) => {
    const token = req.headers["x-org-token"]; // Read from custom header

    if (!token) {
      return res.status(401).json({ message: "Missing or invalid org token" });
    }

    try {
      const decoded = jwt.verify(token, ORGSECRET);

      req.orgUser = {
        userId: decoded.userId,
        orgId: decoded.orgId,
        role: decoded.role,
        employeeId: decoded.employeeId,
        permissions: decoded.permissions,
      };

      next();
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired org token" });
    }
  };
};

export const checkPermission = (moduleName, actionName) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const orgId = req.orgUser.orgId;
      console.log("orgId", orgId);

      if (!userId || !orgId) {
        return res.status(401).json({ error: "Unauthorized access" });
      }

      const member = await OrgMember.findOne({
        userId,
        organizationId: orgId,
      }).populate("role");
      // console.log("member", member);
      // const permisionscheck=member.role.permissions.map(perm=>console.log(perm));
      if (!member) {
        return res
          .status(403)
          .json({ error: "User not part of this organization" });
      }

      let permissions = [];

      // Use custom override if it exists
      if (member.permissionsOverride && member.permissionsOverride.length > 0) {
        permissions = member.permissionsOverride;
      } else if (member.role && member.role.permissions) {
        permissions = member.role.permissions;
      }

      const modulePerm = permissions.find((perm) => perm.module === moduleName);

      if (!modulePerm || !modulePerm.actions.includes(actionName)) {
        return res
          .status(403)
          .json({
            error:  `you don't have permission for this action . contact admin for permission`,
          });
      }

      next();
    } catch (error) {
      console.error("Permission middleware error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
};


