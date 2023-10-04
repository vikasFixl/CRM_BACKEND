const mongoose = require("mongoose");
const ReminderSchema = new mongoose.Schema(
  {
    date: { type: Date },
    time: { type: String },
    text: { type: String }
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("ReminderModel", ReminderSchema);
