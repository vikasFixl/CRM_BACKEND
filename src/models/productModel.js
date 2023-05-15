const mongoose = require("mongoose");
const productSchema = new mongoose.Schema(
  {
    name: { type: String },
    type: { type: String },
    cat: { type: String },
    tax: { type: String },
    price: { type: String },
    desc: { type: String },
    hsn: { type: String },
    sac: { type: String },
    delete: { type: Boolean, default: false },
    firmId: { type: mongoose.Schema.Types.ObjectId, ref: "Firm" },
    orgId: { type: mongoose.Schema.Types.ObjectId, ref: "ORG" },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);
