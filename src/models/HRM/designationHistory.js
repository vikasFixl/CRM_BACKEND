const mongoose = require('mongoose');

const designationHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee', // Assuming you have a User model defined separately
    required: true,
  },
  designation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Designation', // Assuming you have a Designation model defined separately
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
  },
  comment: {
    type: String,
  },
});

const DesignationHistory = mongoose.model(
  'DesignationHistory',
  designationHistorySchema
);

module.exports = DesignationHistory;
