const mongoose = require('mongoose');

const rolePermissionSchema = new mongoose.Schema({
  role: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role', // Assuming you have a 'Role' model
      required: true,
    },
  ],
  permission: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Permission', // Assuming you have a 'Permission' model
      required: true,
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

// Create a composite unique index on role and permission
rolePermissionSchema.index({ role: 1, permission: 1 }, { unique: true });

const RolePermission = mongoose.model('RolePermission', rolePermissionSchema);

module.exports = RolePermission;
