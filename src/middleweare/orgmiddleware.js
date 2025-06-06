import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import path from "path";
dotenv.config({path:"../../.env"});

const ORGSECRET = process.env.ORG_SECRET 


export const authenticateOrgToken = (allowedRoles = []) => {
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
