const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema(
  {
    role: { type: String },
    permission: { type: Array },
    orgId: { type: mongoose.Schema.Types.ObjectId, ref: "ORG" },
  },
  {
    timestamps: true,
  }
);

const role = mongoose.model("rolesNpermissions", roleSchema);
module.exports = role;
