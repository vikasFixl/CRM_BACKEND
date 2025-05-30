import jwt from "jsonwebtoken";

const ORGSECRET = process.env.JWT_SECRET || "your-org-secret-key";

export const authenticateOrgToken = (allowedRoles = []) => {
  return (req, res, next) => {
    const token = req.headers["x-org-token"]; // Read from custom header

    if (!token) {
      return res.status(401).json({ message: "Missing or invalid org token" });
    }

    try {
      const decoded = jwt.verify(token, ORGSECRET);

      if (!allowedRoles.includes(decoded.role)) {
        return res.status(403).json({ message: "You are not authorized" });
      }

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
