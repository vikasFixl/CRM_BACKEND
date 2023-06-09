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
    clientAddress: {
      lineOne: { type: String },
      lineTwo: { type: String },
      country: { type: String },
      state: { type: String },
      city: { type: String },
      code: { type: String },
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
    pipeline: {
      department: {
        type: String,
        required: true,
      },
      userType: { type: String },
      assignTo: { type: String },
    },
    status: {
      type: String,
      required: true,
    },
    orgDetails: {
      orgName: { type: String },
      orgEmail: { type: String },
      orgPhone: { type: String },
      orgAddress: {
        orgLineOne: { type: String },
        orgLineTwo: { type: String },
        orgCountry: { type: String },
        orgState: { type: String },
        orgCity: { type: String },
        orgCode: { type: String },
      },
    },
    description: { type: String },
    delete: {
      type: Boolean,
      required: true,
      default: false,
    },
    randomLeadId: { type: String },
    orgId: { type: mongoose.Schema.Types.ObjectId, ref: "ORG" },
    firmId: { type: mongoose.Schema.Types.ObjectId, ref: "Firm" },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("LEAD", LeadSchema);
