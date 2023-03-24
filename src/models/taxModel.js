const mongoose = require("mongoose");

const taxSchema = new mongoose.Schema(
  {
    firmId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FIRM",
      required: true,
    },
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ORG",
      required: true,
    },
    taxRates: [{}],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("TAXRATES", taxSchema);
