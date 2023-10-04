const { getPagination } = require("../../utils/query");
const PublicHoliday = require('../../models/HRM/publicHoliday'); // Import your Mongoose PublicHoliday model

const createPublicHoliday = async (req, res) => {
  if (req.query.query === "deletemany") {
    try {
      // Delete multiple public holidays at once
      const deletedPublicHolidays = await PublicHoliday.deleteMany({
        _id: { $in: req.body },
      });
      return res.status(200).json(deletedPublicHolidays);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  } else if (req.query.query === "createmany") {
    try {
      // Create multiple public holidays
      const createdPublicHolidays = await PublicHoliday.create(req.body);
      return res.status(201).json(createdPublicHolidays);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  } else {
    try {
      // Create a single public holiday
      const { name, date } = req.body;
      const createdPublicHoliday = await PublicHoliday.create({ name, date });
      return res.status(201).json(createdPublicHoliday);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }
};

const getAllPublicHoliday = async (req, res) => {
  if (req.query.query === "all") {
    try {
      const allPublicHolidays = await PublicHoliday.find().sort({ _id: 1 });
      return res.status(200).json(allPublicHolidays);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  } else {
    const { skip, limit } = getPagination(req.query);
    const statusFilter = req.query.status === "false" ? false : true;

    try {
      const query = {
        status: statusFilter,
      };

      const allPublicHolidays = await PublicHoliday.find(query)
        .skip(Number(skip))
        .limit(Number(limit))
        .sort({ _id: 1 });

      return res.status(200).json(allPublicHolidays);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }
};

const getSinglePublicHoliday = async (req, res) => {
  try {
    const publicHolidayId = req.params.id;

    // Find the single public holiday by its ID
    const singlePublicHoliday = await PublicHoliday.findById(publicHolidayId);

    if (!singlePublicHoliday) {
      return res.status(404).json({ message: "Public holiday not found" });
    }

    return res.status(200).json(singlePublicHoliday);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const updateSinglePublicHoliday = async (req, res) => {
  try {
    const publicHolidayId = req.params.id;

    // Find the public holiday by its ID and update its properties
    const updatedPublicHoliday = await PublicHoliday.findByIdAndUpdate(
      publicHolidayId,
      {
        name: req.body.name,
        date: req.body.date,
      },
      { new: true } // To return the updated document
    );

    if (!updatedPublicHoliday) {
      return res.status(404).json({ message: "Public holiday not found" });
    }

    return res.status(200).json(updatedPublicHoliday);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const deleteSinglePublicHoliday = async (req, res) => {
  try {
    const publicHolidayId = req.params.id;

    // Find the public holiday by its ID and delete it
    const deletedPublicHoliday = await PublicHoliday.findByIdAndDelete(publicHolidayId);

    if (!deletedPublicHoliday) {
      return res.status(404).json({ message: "Public holiday not found" });
    }

    return res.status(200).json(deletedPublicHoliday);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
module.exports = {
  createPublicHoliday,
  getAllPublicHoliday,
  getSinglePublicHoliday,
  updateSinglePublicHoliday,
  deleteSinglePublicHoliday,
};
