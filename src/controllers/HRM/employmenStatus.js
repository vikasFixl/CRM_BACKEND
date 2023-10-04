const { getPagination } = require("../../utils/query");
const EmploymentStatus = require("../../models/HRM/employmentStatus");

const createSingleEmployment = async (req, res) => {
  if (req.query.query === "deletemany") {
    try {
      // Delete multiple employment statuses
      const deletedEmployment = await EmploymentStatus.deleteMany({
        _id: { $in: req.body },
      });
      return res.status(200).json(deletedEmployment);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  } else if (req.query.query === "createmany") {
    try {
      // Create multiple employment statuses from an array of objects
      const createdEmployment = await EmploymentStatus.insertMany(req.body, {
        ordered: false,
      });
      return res.status(201).json(createdEmployment);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  } else {
    try {
      // Create a single employment status from an object
      const createdEmployment = await EmploymentStatus.create({
        name: req.body.name,
        colourValue: req.body.colourValue,
        description: req.body.description,
      });
      return res.status(201).json(createdEmployment);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }
};

const getAllEmployment = async (req, res) => {
  if (req.query.query === "all") {
    try {
      const allEmployment = await EmploymentStatus.find().sort({ _id: 1 });
      return res.status(200).json(allEmployment);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  } else {
    const { skip, limit } = getPagination(req.query);
    try {
      const allEmployment = await EmploymentStatus.find()
        .skip(Number(skip))
        .limit(Number(limit))
        .sort({ _id: 1 });
      return res.status(200).json(allEmployment);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }
};

const getSingleEmployment = async (req, res) => {
  try {
    const singleEmployment = await EmploymentStatus.findById(req.params.id);
    return res.status(200).json(singleEmployment);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const updateEmployment = async (req, res) => {
  try {
    const updatedEmployment = await EmploymentStatus.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          name: req.body.name,
          colourValue: req.body.colourValue,
          description: req.body.description,
        },
      },
      { new: true }
    );
    return res.status(200).json(updatedEmployment);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const deletedEmployment = async (req, res) => {
  try {
    const employment = await EmploymentStatus.findByIdAndUpdate(
      req.params.id,
      {
        status: req.body.status,
        colourValue: req.body.colourValue,
        description: req.body.description,
        employee: req.body.employee,
      },
      { new: true }
    );

    if (!employment) {
      return res.status(404).json({ message: "Employment status not found" });
    }

    return res.status(200).json(employment);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createSingleEmployment,
  getAllEmployment,
  getSingleEmployment,
  deletedEmployment,
};
