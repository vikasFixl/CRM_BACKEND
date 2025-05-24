import jwt from "jsonwebtoken";

const ORGSECRET = process.env.JWT_SECRET || "your-org-secret-key";

// This returns a middleware function that checks role access
export const authenticateOrgToken = (allowedRoles = []) => {
  return (req, res, next) => {
      console.log("req.cookies at orgmiddleware", req.cookies);
    const {orgtoken: token} = req.cookies; // Use `cookies` not `cookie`

    if (!token) {
      return res.status(401).json({ message: "Missing or invalid org token" });
    }

    try {
      const decoded = jwt.verify(token, ORGSECRET);

      // Check role access
      if (allowedRoles.length && !allowedRoles.includes(decoded.role)) {
        return res.status(403).json({ message: "You are not allowed to access this route." });
      }

      // Attach decoded info to request
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
