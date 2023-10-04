const mongoose = require("mongoose");
const LeadSchema = new mongoose.Schema(
  {
    clientFName: { type: String },
    clientLName: { type: String },
    clientEmail: { type: String },
    clientPhone: { type: String },
    clientAddress: {
      lineOne: { type: String },
      lineTwo: { type: String },
      country: { type: String },
      state: { type: String },
      city: { type: String },
      code: { type: String },
    },
    timezone: { type: String },
    stage: { type: String },
    currency: { type: String },
    estimatedWorth: { type: String },
    createdDate: { type: String },
    title: { type: String },
    closureDate: { type: String },
    pipeline: {
      department: { type: String },
      userType: { type: String },
      assignTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
    status: { type: String },
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
      default: false,
    },
    randomLeadId: { type: Number },
    orgId: { type: mongoose.Schema.Types.ObjectId, ref: "ORG" },
    firmId: { type: mongoose.Schema.Types.ObjectId, ref: "Firm" },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("LEAD", LeadSchema);
