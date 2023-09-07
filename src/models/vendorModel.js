const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    firmName: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: false,
    },
    phone: {
      type: Number,
      required: false,
    },
    taxId: {
      type: String,
      required: false,
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "vendorId",
      required: false,
    },
    delete: {
      type: Boolean,
      default: false,
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
        required: false,
      },
      country: {
        type: String,
        required: false,
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
    orgId: { type: mongoose.Schema.Types.ObjectId, ref: "ORG" },
    firmId: { type: mongoose.Schema.Types.ObjectId, ref: "Firm" },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Vendor", vendorSchema);
