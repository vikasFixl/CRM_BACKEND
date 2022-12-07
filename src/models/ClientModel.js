const express = require("express");
const mongoose = require("mongoose");

const ClientSchema = new mongoose.Schema([
  {
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    email: {type: String, required: true},
    phone: {type: Number, required: true},
    add: {type: Object, required: true},
    createdAt: {
      type: Date,
      default: new Date(),
    },
  }
]);

const clientModel = mongoose.model("clientModel", ClientSchema);

module.exports = clientModel;
