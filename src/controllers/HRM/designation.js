const { getPagination } = require("../../utils/query");
const Designation = require("../../models/HRM/designation"); // Import your Mongoose model
const Employee = require("../../models/HRM/employee");

const createSingleDesignation = async (req, res) => {
  if (req.query.query === "deletemany") {
    try {
      // Delete multiple designations by IDs
      const deletedDesignations = await Designation.deleteMany({
        _id: { $in: req.body },
      });

      if (!deletedDesignations) {
        return res.status(404).json({ message: "Designations not deleted" });
      }

      return res.status(200).json(deletedDesignations);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  } else if (req.query.query === "createmany") {
    try {
      // Create multiple designations from an array of objects
      const createdDesignations = await Designation.create(req.body);

      if (!createdDesignations) {
        return res.status(404).json({ message: "Designations not created" });
      }

      return res.status(201).json(createdDesignations);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  } else {
    try {
      // Create a single designation from an object
      const createdDesignation = await Designation.create({
        name: req.body.name,
      });

      if (!createdDesignation) {
        return res.status(404).json({ message: "Designation not created" });
      }

      return res.status(201).json(createdDesignation);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }
};

const getAllDesignation = async (req, res) => {
  if (req.query.query === "all") {
    try {
      // Get all designations
      const allDesignations = await Designation.find().sort({ id: 1 });

      return res.status(200).json(allDesignations);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  } else {
    const { skip, limit } = getPagination(req.query);

    try {
      // Get all designations with pagination
      const allDesignations = await Designation.find()
        .sort({ id: 1 })
        .skip(parseInt(skip))
        .limit(parseInt(limit));

      return res.status(200).json(allDesignations);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }
};

const getSingleDesignation = async (req, res) => {
  try {
    const singleDesignation = await Designation.findById(req.params.id);
    // .populate({
    //   path: 'designationHistory',
    //   select: 'user',
    //   populate: {
    //     path: 'user',
    //     select: 'id firstName lastName',
    //   },
    // });

    if (!singleDesignation) {
      return res.status(404).json({ message: "Designation not found" });
    }

    return res.status(200).json(singleDesignation);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const updateSingleDesignation = async (req, res) => {
  try {
    const updatedDesignation = await Designation.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name },
      { new: true }
    );

    if (!updatedDesignation) {
      return res.status(404).json({ message: "Designation not updated" });
    }

    return res.status(200).json(updatedDesignation);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

//allDesignationWiseEmployee is a function that returns all the employees with their designation
const allDesignationWiseEmployee = async (req, res) => {
  try {
    // Fetch all users with their designation history
    const users = await Employee.find()
      .select("id firstName lastName designationHistory")
      // .populate({
      //   path: "designationHistory",
      //   select: "designation",
      //   options: { sort: { id: -1 }, limit: 1 },
      //   populate: {
      //     path: "designation",
      //     select: "id name",
      //   },
      // });

    // Map users to the desired structure
    const data = users.map((user) => ({
      designationId: user.designationHistory[0].designation.id,
      designationName: user.designationHistory[0].designation.name,
      employee: [
        {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      ],
    }));

    // Combine employees by designation
    const result = data.reduce((acc, current) => {
      const x = acc.find(
        (item) => item.designationId === current.designationId
      );
      if (!x) {
        return acc.concat([current]);
      } else {
        x.employee = x.employee.concat(current.employee);
        return acc;
      }
    }, []);

    // Fetch all designations
    const allDesignations = await Designation.find().sort({ id: 1 });

    // Map designations with the result
    const finalResult = allDesignations.map((designation) => {
      const x = result.find((item) => item.designationId === designation.id);
      if (!x) {
        return {
          designationId: designation.id,
          designationName: designation.name,
          employee: [],
        };
      } else {
        return x;
      }
    });

    return res.status(200).json(finalResult);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const singleDesignationWiseEmployee = async (req, res) => {
  try {
    // Fetch all users with their designation history
    const users = await Employee.find()
      .select("id firstName lastName designationHistory")
      .populate({
        path: "designationHistory",
        select: "designation",
        options: { sort: { id: -1 }, limit: 1 },
        populate: {
          path: "designation",
          select: "id name",
        },
      });

    // Map users to the desired structure
    const data = users.map((user) => ({
      designationId: user.designationHistory[0].designation.id,
      designationName: user.designationHistory[0].designation.name,
      employee: [
        {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      ],
    }));

    // Combine employees by designation
    const result = data.reduce((acc, current) => {
      const x = acc.find(
        (item) => item.designationId === current.designationId
      );
      if (!x) {
        return acc.concat([current]);
      } else {
        x.employee = x.employee.concat(current.employee);
        return acc;
      }
    }, []);

    // Fetch all designations
    const allDesignations = await Designation.find().sort({ id: 1 });

    // Map designations with the result to include only the desired designation
    const finalResult = allDesignations.map((designation) => {
      const x = result.find((item) => item.designationId === designation.id);
      if (!x) {
        return {
          designationId: designation.id,
          designationName: designation.name,
          employee: [],
        };
      } else {
        return x;
      }
    });

    // Find and return the single designation based on the provided ID
    const singleDesignation = finalResult.find(
      (item) => item.designationId === parseInt(req.params.id)
    );

    if (!singleDesignation) {
      return res.status(404).json({ message: "Designation not found" });
    }

    return res.status(200).json(singleDesignation);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const deleteSingleDesignation = async (req, res) => {
  try {
    const deletedDesignation = await Designation.findByIdAndDelete(
      req.params.id
    );

    if (!deletedDesignation) {
      return res.status(404).json({ message: "Designation delete failed" });
    }

    return res.status(200).json(deletedDesignation);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createSingleDesignation,
  getAllDesignation,
  getSingleDesignation,
  updateSingleDesignation,
  allDesignationWiseEmployee,
  singleDesignationWiseEmployee,
  deleteSingleDesignation,
};
