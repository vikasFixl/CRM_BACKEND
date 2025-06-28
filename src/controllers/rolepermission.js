import { RolePermission } from "../models/RolePermission.js";
import { MODULES, PERMISSIONS } from "../enums/role.enums.js";
export const createCustomRolePermission = async (req, res) => {
  try {
    const orgId = req.orgUser.orgId;
    const { role, name, permissions } = req.body;

    // Basic validation
    if (!role || !name || !Array.isArray(permissions)) {
      return res
        .status(400)
        .json({ message: "Role, name, and permissions are required" });
    }

    // Validate modules and actions
    for (const perm of permissions) {
      if (!MODULES[perm.module]) {
        return res
          .status(400)
          .json({ message: `Invalid module: ${perm.module}` });
      }
      for (const action of perm.actions) {
        if (!PERMISSIONS[action]) {
          return res.status(400).json({ message: `Invalid action: ${action}` });
        }
      }
    }

    // Check for duplicate role within same org
    const existing = await RolePermission.findOne({ orgId, name });
    if (existing) {
      return res.status(400).json({ message: "role already with this name " });
    }

    const newRolePermission = await RolePermission.create({
      orgId,
      role,
      name,
      permissions,
    });

    return res.status(201).json({
      message: "Custom  permission created successfully",
      data: newRolePermission,
    });
  } catch (error) {
    console.error("Error creating custom role permission:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// used to fetch all custom role permissions
export const getAllCustomRolePermissions = async (req, res) => {
  try {
    const orgId = req.orgUser.orgId;
    const rolePermissions = await RolePermission.find({ orgId });
    return res.status(200).json({
      message: "All custom role permissions fetched successfully",
      data: rolePermissions,
    });
  } catch (error) {
    console.error("Error fetching custom role permissions:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
export const getAllAvailablePermissions = async (req, res) => {
  try {
    const permissions = await RolePermission.find({}, "permissions");

    const moduleWisePermissions = {};

    permissions.forEach((role) => {
      role.permissions.forEach(({ module, actions }) => {
        if (!moduleWisePermissions[module]) {
          moduleWisePermissions[module] = new Set();
        }
        actions.forEach((action) => {
          moduleWisePermissions[module].add(action);
        });
      });
    });

    // Convert sets to arrays
    const result = {};
    for (const [module, actionsSet] of Object.entries(moduleWisePermissions)) {
      result[module] = Array.from(actionsSet);
    }

    return res.status(200).json({
      message: "Available permissions fetched successfully",
      permissions: result,
    });
  } catch (error) {
    console.error("Error fetching available permissions:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
