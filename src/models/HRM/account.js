const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema(
  {
    name: { type: String, unique: true },
    type: String,
  },
  {
    timestamps: true, // Enable timestamps
  }
);

const Account = mongoose.model('Account', accountSchema);

module.exports = Account;
