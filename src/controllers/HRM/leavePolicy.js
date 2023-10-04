const { getPagination } = require("../../utils/query");
const LeavePolicy = require('../../models/HRM/leavePolicy'); // Import your Mongoose model

const createSingleLeavePolicy = async (req, res) => {
  if (req.query.query === 'deletemany') {
    try {
      // Delete multiple leave policies by IDs
      const deletedLeavePolicy = await LeavePolicy.deleteMany({
        _id: { $in: req.body },
      });
      return res.status(200).json(deletedLeavePolicy);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  } else if (req.query.query === 'createmany') {
    try {
      // Create multiple leave policies from an array of objects
      const createdLeavePolicies = await LeavePolicy.create(req.body);
      return res.status(201).json(createdLeavePolicies);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  } else {
    try {
      // Create a single leave policy
      const createdLeavePolicy = await LeavePolicy.create({
        name: req.body.name,
        paidLeaveCount: parseInt(req.body.paidLeaveCount),
        unpaidLeaveCount: parseInt(req.body.unpaidLeaveCount),
      });

      return res.status(201).json(createdLeavePolicy);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }
};


const getAllLeavePolicy = async (req, res) => {
  if (req.query.query === 'all') {
    try {
      const allLeavePolicy = await LeavePolicy.find()
        .sort({ id: 1 })
        .populate({
          path: 'users',
          select: 'id firstName lastName userName',
        });

      return res.status(200).json(allLeavePolicy);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  } else {
    const { skip, limit } = getPagination(req.query);
    const statusFilter = req.query.status === 'false' ? false : true;

    try {
      const allLeavePolicy = await LeavePolicy.find({ status: statusFilter })
        .sort({ id: 1 })
        .skip(Number(skip))
        .limit(Number(limit))
        .populate({
          path: 'users',
          select: 'id firstName lastName userName',
        });

      return res.status(200).json(allLeavePolicy);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }
};
const getSingeLeavePolicy = async (req, res) => {
  try {
    const singleLeavePolicy = await LeavePolicy.findById(req.params.id).populate({
      path: 'users',
      select: 'id firstName lastName userName',
    });

    if (!singleLeavePolicy) {
      return res.status(404).json({ message: 'Leave policy not found' });
    }

    return res.status(200).json(singleLeavePolicy);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
const updateSingleLeavePolicy = async (req, res) => {
  try {
    const updatedLeavePolicy = await LeavePolicy.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        paidLeaveCount: parseInt(req.body.paidLeaveCount),
        unpaidLeaveCount: parseInt(req.body.unpaidLeaveCount),
      },
      { new: true }
    );

    if (!updatedLeavePolicy) {
      return res.status(404).json({ message: 'Leave policy not found' });
    }

    return res.status(200).json(updatedLeavePolicy);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const deleteSingleLeavePolicy = async (req, res) => {
  try {
    const deletedLeavePolicy = await LeavePolicy.findByIdAndDelete(req.params.id);

    if (!deletedLeavePolicy) {
      return res.status(404).json({ message: 'Leave policy not found' });
    }

    return res.status(200).json(deletedLeavePolicy);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createSingleLeavePolicy,
  getAllLeavePolicy,
  getSingeLeavePolicy,
  updateSingleLeavePolicy,
  deleteSingleLeavePolicy,
};
