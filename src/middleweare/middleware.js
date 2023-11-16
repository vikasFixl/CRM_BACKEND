const jwtDecode = require("jwt-decode");

const permited = (data) => {
  return (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
      res.status(400).json({ msg: "Token Not Found" });
    }
    const role = jwtDecode(token);
    const RoleValidater = data.find((item) => item === role.role);
    if (RoleValidater) {
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
          message: `${action} permission not available for ${module}, please contact the admin.`,
        });
      }
    } catch (error) {
      console.error("Error decoding JWT:", error);
      return res.status(401).json({ message: "Unauthorized" });
    }
  };
};

module.exports.permited = permited;
module.exports.authorize = authorize;
