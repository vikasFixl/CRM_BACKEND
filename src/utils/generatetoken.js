import e from "express";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "your-secret-key";
const ORGSECRET = process.env.JWT_SECRET || "your-org-secret-key";

// Default JWT options for all tokens
const jwtOptions = {
 
  algorithm: "HS256",      // Hash algorithm
 
};

// 1. Global token — used after login
export const generateGlobalToken = (user, options = {expiresIn: "7d"}) => {
  return jwt.sign(
    {
      userId: user._id,
      uuid: user.uuid,
      globalRole: user.role,
      email: user.email,
    },
    SECRET,
    { ...jwtOptions, ...options } // merge custom overrides
  );
};

// 2. Org-scoped token — used for org-specific access
export const generateOrgToken = (
  { userId, orgId, employeeId, role, permissions },
  options = {expiresIn: "1d"}
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
    { ...jwtOptions, ...options }
  );
};
