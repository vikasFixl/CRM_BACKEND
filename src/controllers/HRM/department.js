const { getPagination } = require("../../utils/query");

const Department = require('../../models/HRM/department'); // Import your Mongoose model

const createSingleDepartment = async (req, res) => {
  if (req.query.query === 'deletemany') {
    try {
      // Delete multiple departments by IDs
      const deletedDepartment = await Department.deleteMany({
        _id: { $in: req.body },
      });
      return res.status(200).json(deletedDepartment);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  } else if (req.query.query === 'createmany') {
    try {
      // Create multiple departments from an array of objects
      const createdDepartments = await Department.create(req.body);
      return res.status(201).json(createdDepartments);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  } else {
    try {
      // Create a single department
      const createdDepartment = await Department.create({
        name: req.body.name,
      });
      return res.status(201).json(createdDepartment);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }
};


const getAllDepartment = async (req, res) => {
  if (req.query.query === "all") {
    try {
      const allDepartments = await Department.find()
        .populate({
          path: 'users',
          select: 'id firstName lastName userName',
          populate: {
            path: 'role',
            select: 'name id',
          },
        })
        // .populate({
        //   path: 'users.designationHistory',
        //   options: { sort: { id: -1 }, limit: 1 },
        //   select: 'designation',
        //   populate: {
        //     path: 'designation',
        //     select: 'name id',
        //   },
        // })
        .sort({ id: 1 });

      return res.status(200).json(allDepartments);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  } else {
    const { skip, limit } = getPagination(req.query);

    try {
      const allDepartments = await Department.find()
        .sort({ id: 1 })
        .skip(Number(skip))
        .limit(Number(limit))
        .populate({
          path: 'users',
          select: 'id firstName lastName userName',
          populate: {
            path: 'role',
            select: 'name id',
          },
        })
        // .populate({
        //   path: 'users.designationHistory',
        //   options: { sort: { id: -1 }, limit: 1 },
        //   select: 'designation',
        //   populate: {
        //     path: 'designation',
        //     select: 'name id',
        //   },
        // });

      return res.status(200).json(allDepartments);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }
};

const getSingleDepartment = async (req, res) => {
  try {
    const singleDepartment = await Department.findById(req.params.id)
      .populate({
        path: 'users',
        select: 'id firstName lastName userName',
        populate: {
          path: 'role',
          select: 'name id',
        },
      })
      // .populate({
      //   path: 'user.designationHistory',
      //   options: { sort: { id: -1 }, limit: 1 },
      //   select: 'designation',
      //   populate: {
      //     path: 'designation',
      //     select: 'name id',
      //   },
      // });

    if (!singleDepartment) {
      return res.status(404).json({ message: 'Department not found' });
    }

    const userId = singleDepartment.users.map((user) => user.id);

    // if (
    //   (req.auth.sub !== userId[0] &&
    //     !req.auth.permissions.includes('readAll-department')) ||
    //   !req.auth.permissions.includes('readSingle-department')
    // ) {
    //   return res.status(401).json({ message: 'Unauthorized' });
    // }

    return res.status(200).json(singleDepartment);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};


const updateSingleDepartment = async (req, res) => {
  try {
    const updatedDepartment = await Department.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name },
      { new: true }
    );

    if (!updatedDepartment) {
      return res.status(404).json({ message: 'Department not found' });
    }

    return res.status(200).json(updatedDepartment);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const deletedDepartment = async (req, res) => {
  try {
    const updatedDepartment = await Department.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );

    if (!updatedDepartment) {
      return res.status(404).json({ message: 'Department not found' });
    }

    return res.status(200).json(updatedDepartment);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createSingleDepartment,
  getAllDepartment,
  getSingleDepartment,
  updateSingleDepartment,
  deletedDepartment,
};
