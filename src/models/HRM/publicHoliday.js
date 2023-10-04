const mongoose = require('mongoose');

const publicHolidaySchema = new mongoose.Schema(
  {
    name: String,
    date: Date,
    status: { type: Boolean, default: true },
  },
  {
    timestamps: true, // Enable timestamps
  }
);

const PublicHoliday = mongoose.model('PublicHoliday', publicHolidaySchema);

module.exports = PublicHoliday;
