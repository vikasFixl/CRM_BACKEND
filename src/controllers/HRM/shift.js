const { getPagination } = require("../../utils/query");
const moment = require("moment");
const Shift = require("../../models/HRM/shift");
const Employee = require("../../models/HRM/employee");

const createShift = async (req, res) => {
  if (req.query.query === "deletemany") {
    try {
      // Delete many shifts at once
      const deletedShift = await Shift.deleteMany({
        _id: { $in: req.body },
      });

      return res.status(200).json(deletedShift);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  } else if (req.query.query === "createmany") {
    try {
      // Create many shifts from an array of objects
      const createdShift = await Shift.create(req.body);

      return res.status(201).json(createdShift);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  } else {
    try {
      // Calculate work hours using moment.js
      let workHour = moment(req.body.endTime).diff(
        moment(req.body.startTime),
        "hours"
      );
      console.log("workHouir", workHour);
      if (workHour < 0) {
        workHour = 24 + workHour;
      }

      // Create a single shift
      const createdShift = await Shift.create({
        name: req.body.name,
        startTime: new Date(req.body.startTime),
        endTime: new Date(req.body.endTime),
        workHour: workHour,
      });

      return res.status(201).json(createdShift);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }
};

const getAllShift = async (req, res) => {
  if (req.query.query === "all") {
    try {
      const allShift = await Shift.find().sort({ _id: "asc" });

      return res.status(200).json(allShift);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  } else {
    const { skip, limit } = getPagination(req.query);
    try {
      // Get all shifts paginated
      const allShift = await Shift.find()
        .sort({ _id: "asc" })
        .skip(parseInt(skip))
        .limit(parseInt(limit));

      return res.status(200).json(allShift);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }
};

const getSingleShift = async (req, res) => {
  try {
    const shiftId = req.params.id; // Assuming your shift documents have an 'id' field
    const singleShift = await Shift.findOne({ _id: shiftId });
    const employee = await Employee.find({ shiftId: shiftId });
    singleShift.users = employee;
    if (!singleShift) {
      return res.status(404).json({ message: "Shift not found" });
    }
    return res.status(200).json(singleShift);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const updateSingleShift = async (req, res) => {
  try {
    const shiftId = req.params.id; // Assuming your shift documents have an 'id' field

    // Calculate workHour

    let workHour = moment(req.body.endTime).diff(
      moment(req.body.startTime),
      "hours"
    );
    if (workHour < 0) {
      workHour = 24 + workHour;
    }

    // Define the update data
    const updateData = {
      name: req.body.name,
      startTime: new Date(req.body.startTime),
      endTime: new Date(req.body.endTime),
      workHour: workHour,
    };

    // Use findOneAndUpdate to update the shift
    const updatedShift = await Shift.findOneAndUpdate(
      { _id: shiftId },
      updateData,
      { new: true } // Return the updated document
    );

    if (!updatedShift) {
      return res.status(404).json({ message: "Shift not found" });
    }

    return res.status(200).json(updatedShift);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
const deleteSingleShift = async (req, res) => {
  try {
    const shiftId = req.params.id; // Assuming your shift documents have an 'id' field

    // Use findOneAndDelete to find and delete the shift
    const deletedShift = await Shift.findOneAndDelete({ _id: shiftId });

    if (!deletedShift) {
      return res.status(404).json({ message: "Shift not found" });
    }

    return res.status(200).json(deletedShift);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createShift,
  getAllShift,
  getSingleShift,
  updateSingleShift,
  deleteSingleShift,
};
