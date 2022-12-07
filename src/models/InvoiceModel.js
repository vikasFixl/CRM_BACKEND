const mongoose = require("mongoose");
const { stringify } = require("querystring");

const InvoiceSchema = new mongoose.Schema({
  items: [
    {
      itemName: { type: String },
      unitPrice: { type: String },
      quantity: { type: String },
    },
  ],
  gstn: { type: String },
  notes: { type: String },
  remark: { type: String },
  client: {
    name: {type: String},
    email: { type: String },
    phone: { type: Number },
    address: { type: String },
  },

  vat: { type: Number },
  subTotal: { type: Number },
  total: { type: Number },
  amount: { type: Number },
  invoiceDate: { type: Date },
  dueDate: { type: Date },
  status: { type: String },

  delete: { type: Boolean },
  invoiceNumber: { type: Number },
});

const InvoiceModel = mongoose.model("InvoiceModel", InvoiceSchema);

module.exports = InvoiceModel;
