const { getPagination } = require("../../utils/query");
const WeeklyHoliday = require('../../models/HRM/weeklyHoliday'); // Import your Mongoose model

const createSingleWeeklyHoliday = async (req, res) => {
  if (req.query.query === 'deletemany') {
    try {
      // Delete multiple weekly holidays by IDs
      const deletedWeeklyHoliday = await WeeklyHoliday.deleteMany({
        _id: { $in: req.body },
      });
      return res.status(200).json(deletedWeeklyHoliday);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  } else if (req.query.query === 'createmany') {
    try {
      // Create multiple weekly holidays from an array of objects
      const createdWeeklyHolidays = await WeeklyHoliday.create(req.body);
      return res.status(201).json(createdWeeklyHolidays);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  } else {
    try {
      // Create a single weekly holiday
      const createdWeeklyHoliday = await WeeklyHoliday.create({
        name: req.body.name,
        startDay: req.body.startDay,
        endDay: req.body.endDay,
      });

      return res.status(201).json(createdWeeklyHoliday);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }
};

const getAllWeeklyHoliday = async (req, res) => {
  if (req.query.query === 'all') {
    try {
      const allWeeklyHoliday = await WeeklyHoliday.find()
        .sort({ id: 1 })
        .populate({
          path: 'users',
          select: 'id firstName lastName userName',
        });

      return res.status(200).json(allWeeklyHoliday);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  } else {
    const { skip, limit } = getPagination(req.query);
    const statusFilter = req.query.status === 'false' ? false : true;

    try {
      const allWeeklyHoliday = await WeeklyHoliday.find({ status: statusFilter })
        .sort({ id: 1 })
        .skip(Number(skip))
        .limit(Number(limit))
        .populate({
          path: 'users',
          select: 'id firstName lastName userName',
        });

      return res.status(200).json(allWeeklyHoliday);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }
};

const getSingleWeeklyHoliday = async (req, res) => {
  try {
    const singleWeeklyHoliday = await WeeklyHoliday.findById(req.params.id).populate({
      path: 'users',
      select: 'id firstName lastName userName',
    });

    if (!singleWeeklyHoliday) {
      return res.status(404).json({ message: 'Weekly Holiday not found' });
    }

    return res.status(200).json(singleWeeklyHoliday);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const updateSingleWeeklyHoliday = async (req, res) => {
  try {
    const updatedWeeklyHoliday = await WeeklyHoliday.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        startDay: req.body.startDay,
        endDay: req.body.endDay,
      },
      { new: true }
    );

    if (!updatedWeeklyHoliday) {
      return res.status(404).json({ message: 'Weekly Holiday not found' });
    }

    return res.status(200).json(updatedWeeklyHoliday);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const deleteSingleWeeklyHoliday = async (req, res) => {
  try {
    const deletedWeeklyHoliday = await WeeklyHoliday.findByIdAndDelete(req.params.id);

    if (!deletedWeeklyHoliday) {
      return res.status(404).json({ message: 'Weekly Holiday not found' });
    }

    return res.status(200).json(deletedWeeklyHoliday);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createSingleWeeklyHoliday,
  getAllWeeklyHoliday,
  getSingleWeeklyHoliday,
  updateSingleWeeklyHoliday,
  deleteSingleWeeklyHoliday,
};
