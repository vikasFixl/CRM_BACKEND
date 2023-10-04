const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true,
  },
  status: {
    type: Boolean,
    default: true,
  },
  rolePermission: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RolePermission', // Assuming you have a 'RolePermission' model
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  user: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Assuming you have a 'User' model
    },
  ],
});

const Role = mongoose.model('Role', roleSchema);

module.exports = Role;
