const mongoose = require("mongoose");

const ClientSchema = new mongoose.Schema(
  {
    clientFirmName: { type: String, required: false },
    firstName: { type: String, required: false },
    lastName: { type: String, required: false },
    website: { type: String, required: false },
    email: { type: String, required: true },
    phone: { type: Number, required: true },
    add: { type: Object, required: true },
    contectPerson: {
      name: {
        type: String,
        required: false,
      },
      email: {
        type: String,
        required: false,
      },
      address1: {
        type: String,
        required: false,
      },
      address2: {
        type: String,
        required: false,
      },
      city: {
        type: String,
        required: false,
      },
      state: {
        type: String,
        required: false,
      },
      pinCode: {
        type: Number,
        required: false,
      },
      country: {
        type: String,
        required: false,
      },
      phone: {
        type: Number,
        required: false,
      },
      mobile: {
        type: Number,
        required: false,
      },
      altPhone: {
        type: Number,
        required: false,
      },
      altMobile: {
        type: Number,
        required: false,
      },
    },
    taxId: { type: String, required: false },
    orgId: { type: mongoose.Schema.Types.ObjectId, ref: "ORG" },
    firmId: { type: mongoose.Schema.Types.ObjectId, ref: "Firm" },
  },
  {
    timestamps: true,
  }
);

const clientModel = mongoose.model("clientModel", ClientSchema);

module.exports = clientModel;
