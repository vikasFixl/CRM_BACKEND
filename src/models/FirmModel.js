const mongoose = require("mongoose");

const firmSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    invoicePrefix: {
      type: String,
      required: true,
    },
    add: {
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
        required: true,
      },
      country: {
        type: String,
        required: true,
      },
      pinCode: {
        type: Number,
        required: false,
      },
    },
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
    website: {
      type: String,
      required: false,
    },
    gst_no: {
      type: String,
      required: false,
    },
    logo: {
      type: String,
      required: false,
    },
    registeredFirmName: { type: String, required: false },
    uin: {
      type: String,
      required: false,
    },
    tinNo: { type: String, required: false },
    cinNo: { type: String, required: false },
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ORG",
      required: true,
    },
  },
  { 
    timestamps: true,
  }
);

const Firm = mongoose.model("Firm", firmSchema);

module.exports = Firm;
