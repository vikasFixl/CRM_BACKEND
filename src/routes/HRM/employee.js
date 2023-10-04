const authorize = require("../../utils/authorize");
const express = require("express");
const {
  login,
  register,
  getAllUser,
  getSingleUser,
  updateSingleUser,
  deleteSingleUser,
} = require("../../controllers/HRM/employee");
const userRoutes = express.Router();

userRoutes.post("/login", login); // public route
userRoutes.post(
  "/register",
  // authorize("create-user"),
  register
); // public route
userRoutes.get("/", getAllUser); // readUser only
userRoutes.get("/:id",
 //authorize("readSingle-user"),
  getSingleUser); // authenticated users can read their own and readUser
userRoutes.put("/:id",
//  authorize("update-user"), 
 updateSingleUser); // authenticated users can update their own and updateUser
userRoutes.patch("/:id", 
// authorize("delete-user"), 
deleteSingleUser); // deleteUser only

module.exports = userRoutes;
