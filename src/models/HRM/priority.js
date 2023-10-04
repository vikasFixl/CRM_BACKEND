const mongoose = require('mongoose');

const prioritySchema = new mongoose.Schema(
  {
    name: { type: String, unique: true },
    status: { type: Boolean, default: true },
  },
  {
    timestamps: true, // Enable timestamps
  }
);

const Priority = mongoose.model('Priority', prioritySchema);

module.exports = Priority;
