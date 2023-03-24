const mongoose = require("mongoose");
// const { stringify } = require("querystring");

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
    orgId: { type: mongoose.Schema.Types.ObjectId, ref: "ORG" },
    resetToken: String,
    expireToken: Date,
    permissions: [{}],
    profilePhoto: { type: String },
    eid: { type: String },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
