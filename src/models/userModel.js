const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    role: {
      type: String,
      required: true,
    },
    designation: {
      type: String,
      required: false,
    },
    department: {
      type: String,
      required: true,
    },
    phone: {
      type: Number,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    permissions: {
      type: Array,
      required: false,
    },
    delete: {
      type: String,
      required: false,
      default: false
    },
    profilePhoto: { type: String },
    eid: { type: String },
    orgId: { type: mongoose.Schema.Types.ObjectId, ref: "ORG" },
    firmId: { type: mongoose.Schema.Types.ObjectId, ref: "Firm" },
    resetToken: {
      type: String,
      required: false,
    },
    expireToken: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
