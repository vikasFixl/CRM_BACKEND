const { getPagination } = require("../../utils/query");
// Import your Mongoose model for LeaveApplication here
const LeaveApplication = require('../../models/HRM/leaveApplication'); // Adjust the import path as needed

const createSingleLeave = async (req, res) => {
  try {
    if (req.query.query === 'deletemany') {
      // Handle delete many leave applications if needed
      return res.status(400).json({ message: 'Delete many not supported in this controller' });
    } else {
      // Create a new leave application from the request body
      const leaveFrom = new Date(req.body.leaveFrom);
      const leaveTo = new Date(req.body.leaveTo);
      const leaveDuration = Math.round((leaveTo - leaveFrom) / (1000 * 60 * 60 * 24));

      const newLeave = new LeaveApplication({
        user: req.body.userId, // Assuming userId is provided in the request body
        leaveType: req.body.leaveType,
        leaveFrom: leaveFrom,
        leaveTo: leaveTo,
        leaveDuration: leaveDuration,
        reason: req.body.reason ? req.body.reason : undefined,
      });

      // Save the new leave application to the database
      const createdLeave = await newLeave.save();

      return res.status(201).json(createdLeave);
    }
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: error.message });
  }
};

const getAllLeave = async (req, res) => {
  try {
    let query = {};

    if (req.query.query === 'all') {
      // Fetch all leave applications with user details
      query = LeaveApplication.find()
        .sort({ id: 'asc' })
        .populate('user', 'firstName lastName');
    } else {
      // Fetch leave applications by status with user details
      const { skip, limit } = getPagination(req.query);
      query = LeaveApplication.find({ status: req.query.status })
        .sort({ id: 'asc' })
        .skip(Number(skip))
        .limit(Number(limit))
        .populate('user', 'firstName lastName');
    }

    const leaveApplications = await query.exec();
    const result = leaveApplications.map((item) => {
      return {
        ...item.toObject(),
        acceptLeaveBy: item.acceptLeaveBy ? item.acceptLeaveBy : null,
      };
    });

    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};


const getSingleLeave = async (req, res) => {
  try {
    const leaveId = req.params.id;

    // Fetch the single leave application with user details
    const singleLeave = await LeaveApplication.findById(leaveId)
      .populate('user', 'id firstName lastName userName')
      .exec();

    if (!singleLeave) {
      return res.status(404).json({ message: 'Leave not found' });
    }

    // Fetch the acceptLeaveBy user details
    let acceptLeaveBy = null;
    if (singleLeave.acceptLeaveBy) {
      acceptLeaveBy = await User.findById(singleLeave.acceptLeaveBy)
        .select('firstName lastName')
        .exec();
    }

    // Check permissions and user authorization (similar to your Prisma-based logic)
    // if (
    //   (req.auth.sub !== singleLeave.userId &&
    //     !req.auth.permissions.includes('readAll-leaveApplication')) ||
    //   !req.auth.permissions.includes('readSingle-leaveApplication')
    // ) {
    //   return res.status(401).json({ message: 'Unauthorized' });
    // }

    const result = {
      ...singleLeave.toObject(),
      acceptLeaveBy: acceptLeaveBy,
    };

    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};


const grantedLeave = async (req, res) => {
  try {
    const leaveId = req.params.id;

    const acceptLeaveFrom = new Date(req.body.acceptLeaveFrom);
    const acceptLeaveTo = new Date(req.body.acceptLeaveTo);
    const leaveDuration = Math.round(
      (acceptLeaveTo.getTime() - acceptLeaveFrom.getTime()) /
        (1000 * 60 * 60 * 24)
    );

    // Update the leave application with granted leave details
    const updatedLeave = await LeaveApplication.findByIdAndUpdate(
      leaveId,
      {
        acceptLeaveBy: req.auth.sub,
        acceptLeaveFrom: acceptLeaveFrom ? acceptLeaveFrom : undefined,
        acceptLeaveTo: acceptLeaveTo ? acceptLeaveTo : undefined,
        leaveDuration: leaveDuration ? leaveDuration : 0,
        reviewComment: req.body.reviewComment ? req.body.reviewComment : undefined,
        status: req.body.status,
      },
      { new: true } // To return the updated leave application
    ).exec();

    if (!updatedLeave) {
      return res.status(404).json({ message: 'Leave not found' });
    }

    // Check permissions and user authorization (similar to your Prisma-based logic)
    if (!req.auth.permissions.includes('grant-leave')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    return res.status(200).json(updatedLeave);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const getLeaveByUserId = async (req, res) => {
  try {
    const userId = req.params.id;

    // Find accepted leave applications for the user
    const acceptedLeaves = await LeaveApplication.find({
      userId: userId,
      status: 'ACCEPTED',
    })
      .sort({ id: 'desc' })
      .exec();

    if (acceptedLeaves.length === 0) {
      return res.status(200).json({ message: 'No leave found for this user' });
    }

    // Check if the user is on leave
    const leaveTo = acceptedLeaves[0].leaveTo;
    const currentDate = new Date();

    let leaveStatus = '';
    if (leaveTo > currentDate) {
      leaveStatus = 'on leave';
    } else {
      leaveStatus = 'not on leave';
    }

    // Get all leave history for the user
    const leaveHistory = await LeaveApplication.find({ userId: userId })
      .sort({ id: 'desc' })
      .exec();

    return res.status(200).json({ leaveHistory, leaveStatus });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createSingleLeave,
  getAllLeave,
  getSingleLeave,
  grantedLeave,
  getLeaveByUserId,
};
