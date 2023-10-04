const mongoose = require('mongoose');

const salaryHistorySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    salary: Number, // Assuming you want to use a Number type for salary
    startDate: String, // You may want to use a Date type here for better date handling
    endDate: Date,
    comment: String,
    status: { type: Boolean, default: true },
  },
  {
    timestamps: true, // Enable timestamps
  }
);

module.exports = mongoose.model('SalaryHistory', salaryHistorySchema);
