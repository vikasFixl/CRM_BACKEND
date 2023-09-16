const mongoose = require("mongoose");
const ReminderSchema = new mongoose.Schema({
  Reminder: [
    {
      key: String,
      reminder: String,
    },
  ],
},
{
    timestamps: true,
  }
);
module.exports = mongoose.model("ReminderModel", ReminderSchema);
