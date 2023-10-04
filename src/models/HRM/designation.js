const mongoose = require('mongoose');

const designationSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true,
  },
  designationHistory: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DesignationHistory',
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

const Designation = mongoose.model('Designation', designationSchema);

module.exports = Designation;
