const { getPagination } = require("../../utils/query");

const RolePermission = require("../../models/HRM/rolePermission");

// const createRolePermission = async (req, res) => {
//   try {
//     if (req.query.query === "deletemany") {
//       const deletedRolePermission = await RolePermission.deleteMany({
//         _id: {
//           $in: req.body,
//         },
//       });
//       res.json(deletedRolePermission);
//     } else {
//       // Convert all incoming data to a specific format.
//       console.log("bdy", req.body);
//       const data = req.body.permissions.map((permission) => {
//         return {
//           role: req.body.role,
//           permission: permission,
//         };
//       });
//       console.log("bdy", data);

//       const createdRolePermission = await RolePermission.create(data);
//       res.status(200).json(createdRolePermission);
//     }
//   } catch (error) {
//     res.status(400).json(error.message);
//     console.log(error.message);
//   }
// };

const createRolePermission = async (req, res) => {
  try {
    if (req.query.query === "deletemany") {
      const deletedRolePermission = await RolePermission.deleteMany({
        _id: { $in: req.body }, // Assuming req.body contains an array of IDs
      });
      res.json(deletedRolePermission);
    } else {
      // Convert all incoming data to a specific format.

      console.log("data", req.body);

      const data = req.body.permissions.map((permission) => {
        return {
          role: req.body.role,
          permission: permission.permission,
        };
      });
      console.log("data", data);
      const createdRolePermission = await RolePermission.create(data);
      res.status(200).json(createdRolePermission);
    }
  } catch (error) {
    res.status(400).json(error.message);
    console.error(error.message);
  }
};
const getAllRolePermission = async (req, res) => {
  if (req.query.query === "all") {
    const allRolePermission = await RolePermission.find()
      .populate("role")
      .populate("permission")
      .sort({ _id: "asc" });
    res.json(allRolePermission);
  } else {
    const { skip, limit } = getPagination(req.query);
    try {
      const allRolePermission = await RolePermission.find()
        .populate("role")
        .populate("permission")
        .sort({ _id: "asc" })
        .skip(Number(skip))
        .limit(Number(limit));

      res.json(allRolePermission);
    } catch (error) {
      res.status(400).json(error.message);
      console.log(error.message);
    }
  }
};

const getSingleRolePermission = async (req, res) => {
  const { id } = req.params;

  try {
    const singleRolePermission = await RolePermission.findById({ _id: id })
      .populate("role")
      .populate("permission");

    if (!singleRolePermission) {
      return res.status(404).json({ message: "Role permission not found" });
    }

    res.json(singleRolePermission);
  } catch (error) {
    res.status(400).json({ message: error.message });
    console.log(error.message);
  }
};

const updateRolePermission = async (req, res) => {
  try {
    // Assuming req.body contains the role_id and an array of permission_id(s)
    const { role_id, permission_id } = req.body;

    // Create an array of objects to update or insert into RolePermission
    const rolePermissionsData = permission_id.map((permissionId) => ({
      role_id,
      permission_id: permissionId,
    }));

    // Use Mongoose's updateMany method to upsert the data
    const result = await RolePermission.updateMany(
      { role_id }, // Filter by role_id
      { $addToSet: { permission_id: { $each: rolePermissionsData } } }, // Add permissions to the array
      { upsert: true } // Create new documents if they don't exist
    );

    // The 'result' object will contain information about the update operation

    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
    console.log(error.message);
  }
};
// delete and update account as per RolePermission

const deleteSingleRolePermission = async (req, res) => {
  try {
    const { id } = req.params;

    // Use Mongoose's deleteOne method to delete a RolePermission document by its ID
    const deletedRolePermission = await RolePermission.deleteOne({ _id: id });

    // Check if the deletion was successful
    if (deletedRolePermission.deletedCount === 1) {
      res.status(200).json({ message: "RolePermission deleted successfully" });
    } else {
      res.status(404).json({ message: "RolePermission not found" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
    console.log(error.message);
  }
};

module.exports = {
  createRolePermission,
  getAllRolePermission,
  getSingleRolePermission,
  updateRolePermission,
  deleteSingleRolePermission,
};
