const mongoose = require("mongoose");
const OrgSchema = new mongoose.Schema(
  {
    orgName: {
      type: String,
      required: true,
    },
    orgLogo: {
      type: String,
      required: false,
    },
    orgEmail: {
      type: String,
      required: true,
      unique: true,
    },
    orgPhone: {
      type: String,
      required: false,
    },
    password: {
      type: String,
      required: false,
    },
    orgDept: {
      type: Array,
      required: false,
    },
    orgLeadStages: {
      type: Array,
      required: false,
    },
    orgLeadStatus: {
      type: Array,
      required: false,
    },
    curConvert: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("ORG", OrgSchema);
