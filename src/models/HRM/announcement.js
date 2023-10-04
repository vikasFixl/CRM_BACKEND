const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    status: { type: Boolean, default: true },
  },
  {
    timestamps: true, // Enable timestamps
  }
);

const Announcement = mongoose.model('Announcement', announcementSchema);

module.exports = Announcement;
