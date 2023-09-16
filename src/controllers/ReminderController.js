
const mongoose = require("mongoose");
const ReminderModel = require("../models/ReminderModel");
const notifier = require('node-notifier');

exports.createReminder = async (req, res) => {

  const jobs = [];

  try {
    const { text, date, time } = req.body;
    const form = req.body;

    const newReminder = new ReminderModel(form);
    const reminderDatetime = new Date(`${date}T${time}`);

    if (isNaN(reminderDatetime)) {
      return res.status(400).send({
        code: 400,
        message: "Unable to create a new reminder"
      });
    }
    const job = setTimeout(() => {
      notifier.notify({
        title: 'Reminder',
        message: text,
        sound: true,
      });
      newReminder.save();
    }, reminderDatetime - Date.now());
    jobs.push(job);
    res.status(201).send({
      success: true,
      code: 201,
      message: "Reminder created successfully!",
    });
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

