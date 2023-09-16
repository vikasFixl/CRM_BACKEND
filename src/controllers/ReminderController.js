const mongoose = require("mongoose");
const ReminderModel = require("../models/ReminderModel"); // Adjust the path as needed

// Function to create a new reminder
exports.createReminder = async (req, res) => {
  try {
    const { key, reminder } = req.body;
    const newReminder = new ReminderModel({ key, reminder });
    const savedReminder = await newReminder.save();
    res.status(201).json(savedReminder);
  } catch (error) {
    res.status(500).json({ error: "Unable to create a new reminder" });
  }
};

// Function to get all reminders
exports.getAllReminders = async (req, res) => {
  try {
    const reminders = await ReminderModel.find();
    res.status(200).json(reminders);
  } catch (error) {
    res.status(500).json({ error: "Unable to fetch reminders" });
  }
};

// Function to update a reminder by ID
exports.updateReminder = async (req, res) => {
  try {
    const { key, reminder } = req.body;
    const updatedReminder = await ReminderModel.findByIdAndUpdate(
      req.params.id,
      { key, reminder },
      { new: true }
    );
    res.status(200).json(updatedReminder);
  } catch (error) {
    res.status(500).json({ error: "Unable to update the reminder" });
  }
};

// Function to delete a reminder by ID
exports.deleteReminder = async (req, res) => {
  try {
    await ReminderModel.findByIdAndRemove(req.params.id);
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: "Unable to delete the reminder" });
  }
};

