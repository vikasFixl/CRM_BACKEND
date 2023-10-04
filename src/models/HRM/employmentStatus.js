const mongoose = require('mongoose');

const employmentStatusSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true,
  },
  colourValue: String,
  description: String,
  user: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employees', // Assuming you have a 'User' model
    },
  ],
  status: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const EmploymentStatus = mongoose.model('EmploymentStatus', employmentStatusSchema);

module.exports = EmploymentStatus;
