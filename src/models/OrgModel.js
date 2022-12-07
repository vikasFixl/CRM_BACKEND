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
    orgDept: {
      type: String,
      required: false,
    },
    orgLeadStages: {
      type: String,
      required: false,
    },
    orgLeadStatus: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("ORG", OrgSchema);
