const mongoose = require('mongoose');

const shiftSchema = new mongoose.Schema(
  {
    name: { type: String, unique: true },
    startTime: { type: Date, get: v => v && v.toTimeString().slice(0, 5) }, // Store as time string
    endTime: { type: Date, get: v => v && v.toTimeString().slice(0, 5) },   // Store as time string
    workHour: Number,
    users: [{ }],
    status: { type: Boolean, default: true },
  },
  {
    timestamps: true, // Enable timestamps
  }
);

module.exports = mongoose.model('Shift', shiftSchema);
