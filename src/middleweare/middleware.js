const jwtDecode = require("jwt-decode");



const permited = (data) => {
  return (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
      res.status(400).json({ msg: "Token Not Found" });
    }
    const role = jwtDecode(token);
    const RoleValidater = data.find(item => item === role.role);
    if (RoleValidater) {
      next();
    } else {
      res.status(403).json({ msg: "You are not allowed to access!" });
    }
  };
};

const authorize=(userPermissions)=> {
  return (req, res, next) => {
    const { module, action } = req.params; // Extract the module and action from the request

    // Find the user's permissions for the requested module
    const user = userPermissions.find((user) => user.userId === req.userId);
    if (!user) {
      return res.status(403).json({ message: 'Access forbidden' });
    }

    const modulePermissions = user.modulePermissions.find(
      (modulePermission) => modulePermission.module === module
    );

    if (!modulePermissions || !modulePermissions.permissions.includes(action)) {
      return res.status(403).json({ message: 'Access forbidden' });
    }

    next(); // User is authorized
  };
}

module.exports.permited = permited;
module.exports.authorize = authorize;