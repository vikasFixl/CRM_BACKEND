const { getPagination } = require("../../utils/query");
const SalaryHistory = require('../../models/HRM/salaryHistory'); // Import your Mongoose model for SalaryHistory here

const createSingleSalaryHistory = async (req, res) => {
  try {
    const queryType = req.query.query;

    if (queryType === 'deletemany') {
      // Delete multiple salary histories
      const deletedSalaryHistory = await SalaryHistory.deleteMany({
        _id: { $in: req.body },
      });
      return res.status(200).json(deletedSalaryHistory);
    } else if (queryType === 'createmany') {
      // Create multiple salary histories from an array of objects
      const createdSalaryHistory = await SalaryHistory.insertMany(req.body);
      return res.status(200).json(createdSalaryHistory);
    } else {
      // Create a single salary history from an object
      const {
        userId,
        salary,
        salaryStartDate,
        salaryEndDate,
        salaryComment,
      } = req.body;

      const newSalaryHistory = new SalaryHistory({
        userId,
        salary,
        startDate: new Date(salaryStartDate),
        endDate: new Date(salaryEndDate),
        comment: salaryComment,
      });

      const createdSalaryHistory = await newSalaryHistory.save();
      return res.status(200).json(createdSalaryHistory);
    }
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const getAllSalaryHistory = async (req, res) => {
  try {
    const queryType = req.query.query;

    if (queryType === 'all') {
      // Get all salary history entries
      const allSalaryHistory = await SalaryHistory.find().sort({ id: 'asc' });
      return res.status(200).json(allSalaryHistory);
    } else {
      // Define filter criteria based on status
      const filter = req.query.status === 'false' ? { status: false } : { status: true };

      const { skip, limit } = getPagination(req.query);

      // Get salary history entries based on filter and pagination
      const salaryHistory = await SalaryHistory.find(filter)
        .sort({ id: 'asc' })
        .skip(Number(skip))
        .limit(Number(limit));

      return res.status(200).json(salaryHistory);
    }
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const getSingleSalaryHistory = async (req, res) => {
  try {
    const singleSalaryHistory = await SalaryHistory.findById(req.params.id)
      .populate('user', 'id firstName lastName userName email');

    if (!singleSalaryHistory) {
      return res.status(404).json({ message: 'Salary history not found' });
    }

    return res.status(200).json(singleSalaryHistory);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const updateSingleSalaryHistory = async (req, res) => {
  try {
    const salaryHistoryId = req.params.id;
    const { query, ...updateData } = req.body;

    if (query === 'status') {
      // Update status
      const updatedSalaryHistory = await SalaryHistory.findByIdAndUpdate(
        salaryHistoryId,
        { $set: { status: updateData.status } },
        { new: true }
      );

      if (!updatedSalaryHistory) {
        return res.status(404).json({ message: 'Salary history not found' });
      }

      return res.status(200).json(updatedSalaryHistory);
    } else {
      // Update salary details
      const updatedSalaryHistory = await SalaryHistory.findByIdAndUpdate(
        salaryHistoryId,
        {
          $set: {
            salary: updateData.salary,
            startDate: new Date(updateData.salaryStartDate),
            endDate: new Date(updateData.salaryEndDate),
            comment: updateData.salaryComment,
          },
        },
        { new: true }
      );

      if (!updatedSalaryHistory) {
        return res.status(404).json({ message: 'Salary history not found' });
      }

      return res.status(200).json(updatedSalaryHistory);
    }
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const deleteSingleSalaryHistory = async (req, res) => {
  try {
    const salaryHistoryId = req.params.id;

    // Find and delete the salary history entry by its ID
    const deletedSalaryHistory = await SalaryHistory.findByIdAndDelete(
      salaryHistoryId
    );

    if (!deletedSalaryHistory) {
      return res.status(404).json({ message: 'Salary history not found' });
    }

    return res.status(200).json(deletedSalaryHistory);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};


module.exports = {
  createSingleSalaryHistory,
  getAllSalaryHistory,
  getSingleSalaryHistory,
  updateSingleSalaryHistory,
  deleteSingleSalaryHistory,
};
