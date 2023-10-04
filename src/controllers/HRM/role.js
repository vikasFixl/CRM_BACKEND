const { getPagination } = require("../../utils/query");
const Role = require("../../models/HRM/role");

const createSingleRole = async (req, res) => {
  try {
    if (req.query.query === "deletemany") {
      const deletedRoles = await Role.deleteMany({
        _id: { $in: req.body },
      });
      res.status(201).json({
        success: true,
        message: "Roles Deleted Successfully",
        data: deletedRoles,
      });
    } else if (req.query.query === "createmany") {
      const rolesToCreate = req.body.map((role) => {
        return {
          name: role.name,
        };
      });

      const createdRoles = await Role.insertMany(rolesToCreate, {
        ordered: false,
      });
      res.status(201).json({
        success: true,
        message: "Roles Created Successfully",
        data: createdRoles,
      });
    } else {
      const createdRole = await Role.create({
        name: req.body.name,
      });  

      res.status(200).json({
        success: true,
        message: "Role Created Successfully",
        data: createdRole,
      });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getAllRole = async (req, res) => {
  if (req.query.query === "all") {
    const allRoles = await Role.find().sort({ _id: "asc" });
    res.json(allRoles);
  } else if (req.query.status === "false") {
    try {
      const { skip, limit } = getPagination(req.query);
      const allRoles = await Role.find({ status: false })
        .sort({ _id: "asc" })
        .skip(Number(skip))
        .limit(Number(limit));
        res.status(201).json({
          success: true,
          message: "All Roles",
          data: allRoles,
        });
      // res.json(allRoles);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  } else {
    const { skip, limit } = getPagination(req.query);
    try {
      const allRoles = await Role.find({ status: true })
        .sort({ _id: "asc" })
        .skip(Number(skip))
        .limit(Number(limit));
        res.status(201).json({
          success: true,
          message: "All Roles",
          data: allRoles,
        });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
};

const getSingleRole = async (req, res) => {
  try {
    const singleRole = await Role.findById(req.params.id);
    if (!singleRole) {
      return res.status(404).json({ message: "Role not found" });
    }
     res.status(201).json({
          success: true,
          message: `${singleRole.name} Role Successfully`,
          data: singleRole,
        });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateSingleRole = async (req, res) => {
  try {
    const updatedRole = await Role.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
      },
      { new: true }
    );
    if (!updatedRole) {
      return res.status(404).json({ message: "Role not found" });
    } 
    res.status(201).json({
      success: true,
      message: `${updatedRole.name} Role Successfully`,
      data: updatedRole,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteSingleRole = async (req, res) => {
  try {
    const deletedRole = await Role.findByIdAndUpdate(
      req.params.id,
      {
        status: req.body.status,
      },
      { new: true }
    );
    if (!deletedRole) {
      return res.status(404).json({ message: "Role not found" });
    }
    res.status(201).json({
      success: true,
      message: `${deletedRole.name} Role Successfully`,
      data: deletedRole,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createSingleRole,
  getAllRole,
  getSingleRole,
  updateSingleRole,
  deleteSingleRole,
};
