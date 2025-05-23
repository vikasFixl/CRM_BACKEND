import { RolePermission } from "../models/RolePermission.js";


export const createRolePermission = async (req, res) => {
  try {
    const { role, permissions } = req.body;

    if (!role || !permissions || !Array.isArray(permissions)) {
      return res
        .status(400)
        .json({
          message: "Role and permissions are required and must be valid.",
        });
    }
    console.log(role, permissions);

    // Check if the role already exists
    const existingRole = await RolePermission.findOne({ role });
    if (existingRole) {
      return res
        .status(409)
        .json({ message: `Role "${role}" already exists.` });
    }

    // Create new role permission
    const newRole = await RolePermission.create({
      role,
      permissions,
   
    });

    return res
      .status(201)
      .json({ message: `Role "${role}" created successfully.`, data: newRole });
  } catch (error) {
    console.error("Error creating role permission:", error);
    return res.status(500).json({ message: "Internal server error", error });
  }
};

export const getallroles = async (req, res) => {
  try {
    const roles = await RolePermission.find();
    res.status(200).json({ message: "Roles fetched successfully", roles });
  } catch (error) {
    res.status(500).json({ error: "Failed to get roles" });
  }
};

export const getRolesbyId = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);
    const roles = await RolePermission.findById(id);

    if (!roles) {
      return res.status(404).json({ message: "Role not found" });
    }
    let data = roles?.permissions;
    res.status(200).json({ message: "Roles fetched successfully", data });
  } catch (error) {
    res.status(500).json({ error: "Failed to get roles" });
  }
};