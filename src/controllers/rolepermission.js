import { RolePermission } from "../models/RolePermission.js";
import { MODULES, PERMISSIONS } from "../enums/role.enums.js";
import { decryptData, encryptData } from "../utils/encryptdata.js";
import dotenv from "dotenv"
dotenv.config({ path: "../../.env" });

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
    const { scope, orgId, workspaceId } = req.query;

    // Always fetch system (global) roles for this scope
    const systemFilter = {
      scope,
      isCustom: false,
      role: { $ne: "SuperAdmin" },
    };

    const systemRoles = await RolePermission.find(systemFilter).select("name permissions isCustom");


    let customRoles = [];

    // If org or workspace specified, fetch custom roles too
    if (orgId || workspaceId) {
      const customFilter = {
        scope,
        isCustom: true,
      };

      if (orgId) customFilter.orgId = orgId;
      if (workspaceId) customFilter.workspaceId = workspaceId;

      customRoles = await RolePermission.find(customFilter).select("name permissions isCustom createdAt");
    }


    // Save these to your database/config file
    // console.log("Store these IVs securely:", ivs);
    const allRoles = [...systemRoles, ...customRoles];

    // 🔐 Encrypt the data
    const encrypted = encryptData(allRoles, process.env.All_Roles_IV);
    const decrypted = decryptData(encrypted.data, encrypted.iv);
    console.log("Decrypted:", decrypted);
    return res.status(200).json({
      message: "Role permissions fetched successfully",
      total: systemRoles.length + customRoles.length,
      permissions: encrypted.data,
      iv: encrypted.iv,
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

    const { workspaceId, scope, orgId } = req.query;

    // 🔹 Fetch system (global) roles excluding SuperAdmin
    const systemFilter = {
      scope,
      isCustom: false,
      name: { $ne: "SuperAdmin" },
    };

    const systemRoles = await RolePermission.find(systemFilter).select("name isCustom");

    let customRoles = [];

    // 🔹 Fetch custom roles based on org + optional workspace
    if (orgId || workspaceId) {
      const customFilter = {
        scope,
        isCustom: true,
        name: { $ne: "SuperAdmin" }, // Ensure custom SuperAdmin is excluded too
        orgId,
      };

      if (workspaceId) {
        customFilter.workspaceId = workspaceId;
      }

      customRoles = await RolePermission.find(customFilter).select("name isCustom createdAt");
    }

    const allRoles = [...systemRoles, ...customRoles];

    // 🔐 Encrypt role names
    const encrypted = encryptData(allRoles, process.env.Role_List_IV);

    return res.status(200).json({
      message: "Role names fetched successfully",
      total: allRoles.length,
      roles: encrypted.data,
      iv: encrypted.iv,
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
