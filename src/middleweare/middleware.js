// middleware.js

import jwtDecode from "jwt-decode";
// import ActivityModel from "../models/activityModel.js";

export const isAuthenticated = (req, res, next) => {
  // console.log("req.cookies", req.cookies);
   const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No Bearer token provided" });
  }

  const token = authHeader.split(" ")[1];


  try {
    const decoded = jwtDecode(token);
    req.user = decoded; // Attach user info for later
    next();
  } catch (err) {
    return res.status(401).json({ msg: "Invalid token" });
  }
};

export const isAdminOrSelf = (req, res, next) => {
 
  const userId = req.user.userId;           // from decoded token
  const paramId = req.params.id;        // from route like /delete/:id
  const role = req.user.role;           // assuming role is 'admin' or 'user'

  console.log(userId, paramId, role);
  if (role === "admin" || userId === paramId) {
    return next();
  }

  return res.status(403).json({ message: "Access denied" });
};


// export const permited = (allowedRoles) => {
//   return (req, res, next) => {
//     const token = req.cookies?.token;
//     if (!token) {
//       return res.status(400).json({ msg: "Token Not Found" });
//     }

//     let role;
//     try {
//       const decoded = jwtDecode(token);
//       role = decoded.role;
//     } catch (err) {
//       return res.status(401).json({ msg: "Invalid token" });
//     }

//     const isRoleValid = allowedRoles.includes(role);
//     if (isRoleValid) {
//       next();
//     } else {
//       res.status(403).json({ msg: "You are not allowed to access!" });
//     }
//   };
// };

// export const authorize = (action, module, role) => {
//   return (req, res, next) => {
//     try {
//       const token = jwtDecode(req.headers.authorization);
//       const permissions = token.permissions;
//       const matchingRoles = role.filter((element) => token.role.includes(element));
//       if (matchingRoles.length === 0) {
//         return res.status(403).json({ message: "Access forbidden" });
//       }
//       const authorized = permissions.some((data) => {
//         return data.module === module && data.action.includes(action);
//       });

//       if (authorized) {
//         next(); // User is authorized
//       } else {
//         return res.status(403).json({
//           message: 'Permission denied, please contact the admin',
//         });
//       }
//     } catch (error) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }
//   };
// };

// export const activityLogger = (moduleName, activity) => {
//   return async (req, res, next) => {
//     try {
//       await ActivityModel.create({ module: moduleName, activity });
//       next();
//     } catch (error) {
//       console.error(`Error logging activity: ${error}`);
//       next(error);
//     }
//   };
// };
