import { RolePermission } from "../models/RolePermission.js";
import { MODULES, PERMISSIONS } from "../enums/role.enums.js";
import { rolepermission } from "../utils/role-permission.js";

export const createCustomRolePermission = async (req, res) => {
  try {
    const orgId = req.orgUser.orgId;
    const workspaceId = req.body.workspaceId; // assuming you pass this in body
    const { role, name, permissions } = req.body;

    // Basic validation
    if (!role || !name || !Array.isArray(permissions)) {
      return res
        .status(400)
        .json({ message: "Role, name, and permissions are required" });
    }
    const validModules = Object.values(MODULES);
    const validActions = Object.keys(PERMISSIONS);


    // Validate permissions (module + actions)
    for (const perm of permissions) {
      if (!validModules.includes(perm.module)) {
        return res
          .status(400)
          .json({ message: `Invalid module: ${perm.module}` });
      }
      // ✅ Check that perm.actions is an array
      if (!Array.isArray(perm.actions)) {
        return res.status(400).json({
          message: `Actions must be an array for module: ${perm.module}`,
        });
      }

      // ✅ Validate each action
      for (const action of perm.actions) {
        if (!validActions.includes(action)) {
          return res.status(400).json({
            message: `Invalid action: ${action} in module: ${perm.module}`,
          });
        }
      }
    }
    // Check for duplicate name within the same org (and workspace if provided)
    const query = { orgId, name };
    if (workspaceId) query.workspaceId = workspaceId;

    const existing = await RolePermission.findOne(query);
    if (existing) {
      return res.status(400).json({
        message: "A role with this name already exists in this organization",
      });
    }

    // Create new role permission
    const newRolePermission = await RolePermission.create({
      orgId,
      workspaceId,
      role, // unique slug like "custom_dev", still useful for reference
      name, // display label
      permissions,
      isCustom: true,
    });

    return res.status(201).json({
      message: "Custom permission created successfully",
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
export const getAllRolePermissions = async (req, res) => {
  try {
    const orgId = req.orgUser.orgId;
    const { workspaceId } = req.query;

    let rolePermissions = [];

    if (workspaceId) {
      // Fetch only roles for this workspace
      rolePermissions = await RolePermission.find({
        orgId,
        workspaceId,
        isCustom: true,
        name: { $ne: "SuperAdmin" },
      });
    } else {
      // Fetch org-level custom roles + global default roles
      rolePermissions = await RolePermission.find({
        $or: [
          {
            orgId,
            workspaceId: { $exists: false },
            name: { $ne: "SuperAdmin" },
          }, // org-level custom roles
          { isDefault: true, name: { $ne: "SuperAdmin" } }, // DB-wide global roles
        ],
      });
    }

    return res.status(200).json({
      message: "Role permissions fetched successfully",
      permissions: rolePermissions,
    });
  } catch (error) {
    console.error("Error fetching role permissions:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
export const getRoleNamesList = async (req, res) => {
  try {
    const orgId = req.orgUser.orgId;
    const { workspaceId } = req.query;

    const queries = [];

    // ✅ 1. Add DB-defined (global) roles
    queries.push({ orgId: { $exists: false } }); // Global predefined roles

    // ✅ 2. Add custom roles based on orgId and (optionally) workspaceId
    if (workspaceId) {
      queries.push({
        orgId,
        workspaceId,
        isCustom: true,
        name: { $ne: "SuperAdmin" },
      });
    } else {
      queries.push({
        orgId,
        workspaceId: null,
      });
    }

    const roles = await RolePermission.find({ $or: queries }).select("name");

    const roleNames = roles.map((r) => r.name);

    return res.status(200).json({
      message: "Role names fetched successfully",
      roles: roleNames,
    });
  } catch (error) {
    console.error("Error fetching role names:", error);
    return res.status(500).json({
      message: "Failed to fetch role names",
      error: error.message,
    });
  }
};

export const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;

    const role = await RolePermission.findById(id);
    if (!role) {
      return res
        .status(404)
        .json({ success: false, message: "Role not found" });
    }

    if (!role.isCustom) {
      return res
        .status(403)
        .json({ success: false, message: "Cannot delete system-defined role" });
    }

    await RolePermission.findByIdAndDelete(id);
    return res
      .status(200)
      .json({ success: true, message: "Custom role deleted" });
  } catch (error) {
    console.error("Error deleting role:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const role = await RolePermission.findById(id);
    if (!role) {
      return res
        .status(404)
        .json({ success: false, message: "Role not found" });
    }

    if (!role.isCustom) {
      return res
        .status(403)
        .json({ success: false, message: "Cannot update system-defined role" });
    }

    const updatedRole = await RolePermission.findByIdAndUpdate(id, updates, {
      new: true,
    });
    return res.status(200).json({
      success: true,
      message: "Custom role updated",
      role: updatedRole,
    });
  } catch (error) {
    console.error("Error updating role:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
