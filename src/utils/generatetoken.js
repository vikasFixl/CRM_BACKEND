
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config({ path: "../../.env" });

const SECRET = process.env.JWT_SECRET
const ORGSECRET = process.env.ORG_SECRET 

// Default JWT options for all tokens
const jwtOptions = {
 
  algorithm: "HS256",      // Hash algorithm
 
};

// 1. Global token — used after login

export const generateGlobalToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      uuid: user.uuid,
      role: user.Globalrole,
      email: user.email,
      firstName: user.firstName,
      
      
    },
    SECRET,
    { ...jwtOptions, expiresIn: "7d" } // merge custom overrides
  );

  
};

// 2. Org-scoped token — used for org-specific access

export const generateOrgToken = (
  { userId, orgId, employeeId, role, permissions },
  
) => {
  return jwt.sign(
    {
      userId,
      orgId,
      employeeId,
      role,
      permissions,
    },
    ORGSECRET,
    { ...jwtOptions, expiresIn: "2d" }
  );
};
