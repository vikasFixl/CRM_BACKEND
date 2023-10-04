const mongoose = require('mongoose');

const educationSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employees' },
    degree: String,
    institution: String,
    fieldOfStudy: String,
    result: String,
    startDate: Date,
    endDate: Date,
    status: { type: Boolean, default: true },
  },
  {
    timestamps: true, // Enable timestamps
  }
);

module.exports = mongoose.model("Education", educationSchema);
