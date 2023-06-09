const mongoose = require("mongoose");
const LeadActivitySchema = new mongoose.Schema(
  {
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LEAD",
      required: true,
    },
    title: {
      type: String,
      required: false,
    },
    desc: {
      type: String,
      required: false,
    },
    type: {
      type: String,
      required: false,
    },
    image: {
      type: String,
      required: false,
    },
    comment: { type: Array },
    orgId: { type: mongoose.Schema.Types.ObjectId, ref: "ORG" },
    firmId: { type: mongoose.Schema.Types.ObjectId, ref: "Firm" },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("LEADACTIVITY", LeadActivitySchema);
