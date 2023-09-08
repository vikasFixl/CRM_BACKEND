const { number } = require("joi");
const mongoose = require("mongoose");

const PermissionSchema = new mongoose.Schema({
  userPermissions: [
    {
      userId: String,
      roles: Array,

      modulePermissions: [
        {
          module: String,
          permissions: Array,
        },

        {
          module: String,
          permissions: Array,
        },
      ],
    },
  ],
});
module.exports = mongoose.model("PermissionModel", PermissionSchema);
