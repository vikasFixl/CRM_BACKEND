const mongoose = require("mongoose");

const taxSchema = new mongoose.Schema(
  {
    firm_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FIRM",
      required: true,
    },
    taxRates: [{}],
    orgId: { type: mongoose.Schema.Types.ObjectId, ref: "ORG" },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("TAXRATES", taxSchema);
