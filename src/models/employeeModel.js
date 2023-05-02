const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: false,
  },
  orgId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ORG",
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  firmId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Firm",
  },
  email: {
    type: String,
  },
  eidPrefix: {
    type: String,
    unique: true,
  },
  eid: {
    type: String,
    unique: true,
  },
  gender: {
    type: String,
    required: false,
  },
  skills: {
    type: Array,
    required: false,
  },
  dob: {
    type: String,
    required: false,
  },
  doj: {
    type: String,
    required: false,
  },
  dol: {
    type: Number,
    required: false,
  },
  designation: {
    type: String,
    required: false,
  },
  panNo: {
    type: String,
    required: false,
  },
  bankDetails: {
    accno: {
      type: String,
    },
    ifsc: {
      type: String,
    },
    bname: {
      type: String,
    },
  },
  totalWorkingDays: {
    type: Number,
  },
  month: [
    {
      jan: { type: Number },
      feb: { type: Number },
      mar: { type: Number },
      apr: { type: Number },
      may: { type: Number },
      jun: { type: Number },
      jul: { type: Number },
      aug: { type: Number },
      sep: { type: Number },
      oct: { type: Number },
      nov: { type: Number },
      dec: { type: Number },
    },
  ],
  leaves: [
    {
      jan: { type: Number },
      feb: { type: Number },
      mar: { type: Number },
      apr: { type: Number },
      may: { type: Number },
      jun: { type: Number },
      jul: { type: Number },
      aug: { type: Number },
      sep: { type: Number },
      oct: { type: Number },
      nov: { type: Number },
      dec: { type: Number },
    },
  ],
});

const employee = mongoose.model("employee", employeeSchema);
module.exports = employee;
