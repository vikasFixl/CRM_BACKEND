const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true,
    enum :["create", "readAll", "readSingle", "update", "delete"]

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
});

const Permission = mongoose.model('Permission', permissionSchema);

module.exports = Permission;
