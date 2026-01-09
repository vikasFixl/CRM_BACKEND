import jwt from "jsonwebtoken";
import dotenv from "dotenv";

import { OrgMember } from "../models/OrganisationMemberSchema.js";
import { verifyOrgToken } from "../utils/generatetoken.js";
dotenv.config({ path: "../../.env" });




export const authenticateOrgToken = () => {
  return (req, res, next) => {
    const token = req.cookies?._fxl_1A2B3C;
// logger.info("token", token);
    const userAgent = req.headers['user-agent']; 

    // logger.info("userAgent", userAgent);
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    if (!token) {
      return res.status(401).json({ message: "invalid token" });
    }

    try {
      const decoded = verifyOrgToken(token, userAgent, ip);
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


      if (!userId || !orgId) {
        return res.status(401).json({ error: "Unauthorized access" });
      }

      const member = await OrgMember.findOne({
        userId,
        organizationId: orgId,
      })
        .populate({
          path: "role",
          populate: {
            path: "permissions", // <-- this is the array of Permission documents
          },
        });

      // const permisionscheck=member.role.permissions.map(perm=>logger.info(perm));
      if (!member) {
        return res
          .status(403)
          .json({ error: "User not part of this organization" });
      }

      // logger.info("member", member);
      let permissions = [];

      // Use custom override if it exists
      if (member.permissionsOverride && member.permissionsOverride.length > 0) {
        permissions = member.permissionsOverride;
      } else if (member.role && member.role.permissions) {
        permissions = member.role.permissions;
      }
      // logger.info("permissions", member.role?.permissions);
      const modulePerm = permissions.find((perm) => perm.module === moduleName);
      // logger.info("modulePerm", modulePerm);

      if (!modulePerm || !modulePerm.actions.includes(actionName)) {
        return res
          .status(403)
          .json({
            error: `you don't have permission for this action . contact admin for permission`,
          });
      }

      next();
    } catch (error) {
      logger.error("Permission middleware error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
};


