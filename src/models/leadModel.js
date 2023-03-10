const mongoose = require("mongoose");
const LeadSchema = new mongoose.Schema(
  {
    clientFName: {
      type: String,
      required: true,
    },
    clientLName: {
      type: String,
      required: true,
    },
    clientEmail: {
      type: String,
      required: true,
    },
    clientPhone: {
      type: String,
      required: true,
    },
    clientCountry: {
      type: String,
      required: true,
    },
    clientState: {
      type: String,
      required: true,
    },
    clientCity: {
      type: String,
      required: true,
    },
    timezone: {
      type: String,
      required: true,
    },
    stage: {
      type: String,
      required: true,
    },
    estimatedWorth: {
      type: String,
      required: true,
    },
    createdDate: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    closureDate: {
      type: String,
      required: true,
    },
    userType: {
      type: String,
      required: true,
    },
    assignTo: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    orgName: {
      type: String,
      required: true,
    },
    orgState: {
      type: String,
      required: true,
    },
    orgDistrict: {
      type: String,
      required: true,
    },
    orgAddress: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    delete: {
      type: Boolean,
      required: true,
      default: false,
    },
    randomLeadId:{
      type: Number,
      default:Math.floor(Math.random() * (10000 - 0)) + 0
    }
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("LEAD", LeadSchema);
