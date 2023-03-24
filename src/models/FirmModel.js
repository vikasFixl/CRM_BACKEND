const mongoose = require("mongoose");

const firmSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String },
  phone: { type: String },
  add: {
    address1: { type: String },
    address2: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    pinCode: { type: Number },
  },
  website: { type: String },
  gst_no: { type: String },
  logo: { type: String },
  uin: { type: String },
  orgId: { type: mongoose.Schema.Types.ObjectId, ref: "ORG" },
});

const Firm = mongoose.model("Firm", firmSchema);

module.exports = Firm;
