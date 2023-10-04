const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema(
  {
    name: String,
    status: { type: Boolean, default: true },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }],
  },
  {
    timestamps: true, // Enable timestamps
  }
);

module.exports = mongoose.model('Department', departmentSchema);
