const { getPagination } = require("../../utils/query");
const Permission = require("../../models/HRM/permission");

const createPermission = async (req, res) => {
  try {
    if (req.query.query === "createmany") {
      const permissionToCreate = req.body.map((permission) => {
        return {
          name: permission.name,
        };
      });
      const createdPermission = await Permission.insertMany(permissionToCreate, {
        ordered: false,
      });
      res.status(201).json({
        success: true,
        message: "Permissions Created Successfully",
        data: createdPermission,
      });
    } else {
      // Convert all incoming data to a specific format.
      const createdPermission = await Permission.create({
        name: req.body.name,
      });  

      res.status(200).json({
        success: true,
        message: "Permission Created Successfully",
        data: createdPermission,
      });
    }
  } catch (error) {
    res.status(400).json(error.message);
    console.log(error.message);
  }
};

const getAllPermission = async (req, res) => {
  if (req.query.query === "all") {
    const allPermissions = await Permission.find().sort({ _id: "asc" });
    res.json(allPermissions);
  } else {
    const { skip, limit } = getPagination(req.query);
    try {
      const allPermissions = await Permission.find()
        .sort({ _id: "asc" })
        .skip(Number(skip))
        .limit(Number(limit));
      res.json(allPermissions);
    } catch (error) {
      res.status(400).json({ message: error.message });
      console.log(error.message);
    }
  }
};

const getSinglePermission = async (req, res) => {
  try {
    const { id } = req.params;

    // Find a Permission document by its ID
    const permission = await Permission.findById(id);

    // Check if the permission exists
    if (!permission) {
      return res.status(404).json({ message: 'Permission not found' });
    }

    res.status(200).json(permission);
  } catch (error) {
    res.status(400).json({ message: error.message });
    console.error(error.message);
  }
};

const deletePermission = async (req, res) => {
  try {
    const { id } = req.params;

    // Delete a Permission document by its ID
    const deletedPermission = await Permission.findByIdAndDelete(id);

    // Check if the permission was deleted
    if (!deletedPermission) {
      return res.status(404).json({ message: 'Permission not found' });
    }

    res.status(200).json({ message: 'Permission deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
    console.error(error.message);
  }
};
const updatePermission = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    // Find the Permission document by its ID and update its name
    const updatedPermission = await Permission.findByIdAndUpdate(
      id,
      { name },
      { new: true } // To get the updated document
    );

    // Check if the permission was updated
    if (!updatedPermission) {
      return res.status(404).json({ message: 'Permission not found' });
    }

    res.status(200).json(updatedPermission);
  } catch (error) {
    res.status(400).json({ message: error.message });
    console.error(error.message);
  }
};


module.exports = {
  getAllPermission,
  createPermission,
  getSinglePermission,
  deletePermission,
  updatePermission
};



