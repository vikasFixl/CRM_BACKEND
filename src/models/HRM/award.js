const mongoose = require('mongoose');

const awardSchema = new mongoose.Schema(
  {
    name: { type: String, unique: true },
    description: String,
    image: String,
    status: { type: Boolean, default: true },
  },
  {
    timestamps: true, // Enable timestamps
  }
);

module.exports = mongoose.model('Award', awardSchema);
