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
      type: Array,
      required: false,
    },
    orgLeadStages: {
      type: Object,
      required: false,
    },
    orgLeadStatus: {
      type: Array,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("ORG", OrgSchema);
