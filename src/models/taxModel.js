const mongoose = require("mongoose");

const taxSchema = new mongoose.Schema(
  {
    firmId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Firm",
      required: false,
    },
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ORG",
      required: true,
    },
    taxRates: [{}],
    globalTax: { type: Boolean, required: true },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("TAXRATES", taxSchema);
