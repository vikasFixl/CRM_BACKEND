const jwtDecode = require("jwt-decode");
const ActivityModel = require("../models/activityModel");

const isAuthenticated = (req, res, next) => {
  console.log("req.cookies", req.cookie);
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwtDecode(token);
    req.user = decoded; // Attach user info for later
    next();
  } catch (err) {
    return res.status(401).json({ msg: "Invalid token" });
  }
};

const permited = (allowedRoles) => {
  return (req, res, next) => {
    // Read token from cookies
    const token = req.cookies?.token; // assumes cookie name is "token"
    if (!token) {
      return res.status(400).json({ msg: "Token Not Found" });
    }

    let role;
    try {
      const decoded = jwtDecode(token);
      role = decoded.role;
    } catch (err) {
      return res.status(401).json({ msg: "Invalid token" });
    }

    const isRoleValid = allowedRoles.includes(role);
    if (isRoleValid) {
      next();
    } else {
      res.status(403).json({ msg: "You are not allowed to access!" });
    }
  };
};

const authorize = (action, module, role) => {
  return (req, res, next) => {
    try {
      const token = jwtDecode(req.headers.authorization);
      const permissions = token.permissions;
      const matchingRoles = role.filter((element) => token.role.includes(element));
      if (matchingRoles.length === 0) {
        return res.status(403).json({ message: "Access forbidden" });
      }
      const authorized = permissions.some((data) => {
        return data.module === module && data.action.includes(action);
      });

      if (authorized) {
        next(); // User is authorized
      } else {
        return res.status(403).json({
          message: 'Permission denied, please contact the admin',
          // message: `${action} permission not available for ${module}, please contact the admin.`,
        });
      }
    } catch (error) {
      return res.status(401).json({ message: "Unauthorized" });
    }
  };
};

const activityLogger = (moduleName, activity) => {
  return async (req, res, next) => {
    try {
      await ActivityModel.create({ module: moduleName, activity, });
      next();
    } catch (error) {
      console.error(`Error logging activity: ${error}`);
      next(error);
    }
  };
};


module.exports.permited = permited;
module.exports.authorize = authorize;
module.exports.activityLogger = activityLogger;
module.exports.isAuthenticated = isAuthenticated;
