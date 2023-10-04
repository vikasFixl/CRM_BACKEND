const mongoose = require('mongoose');

const weeklyHolidaySchema = new mongoose.Schema(
  {
    name: String,
    startDay: String,
    endDay: String,
    status: { type: Boolean, default: true },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Employees' }],
  },
  {
    timestamps: true, // Enable timestamps
  }
);

const WeeklyHoliday = mongoose.model('WeeklyHoliday', weeklyHolidaySchema);

module.exports = WeeklyHoliday;
