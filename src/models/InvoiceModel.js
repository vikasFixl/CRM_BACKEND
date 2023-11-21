const { number } = require("joi");
const mongoose = require("mongoose");

const InvoiceSchema = new mongoose.Schema({
  items: [
    {
      itemName: { type: String },
      unitPrice: { type: String },
      quantity: { type: String },
      amount: { type: Number },
      hsn: { type: String },
      sac: { type: String },
      taxRate:{type: String},
      desc: { type: String },
      discount: { type: Number },
    },
  ],
  gstn: { type: String },
  notes: { type: String },
  remark: { type: String },
  client: {
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String },
    phone: { type: Number },
    taxId: { type: String },
    clientFirmName: { type: String },
    address: {
      address1: { type: String },
      address2: { type: String },
      city: { type: String },
      state: { type: String },
      country: { type: String },
      pinCode: { type: Number },
    },
    client_id: { type: mongoose.Schema.Types.ObjectId, ref: "clientModel" },
  },
  tax: { type: Array },
  taxAmt: { type: Array },
  subTotal: { type: Number },
  total: { type: Number },
  invoiceDate: { type: Date },
  dueDate: { type: Date },
  status: {
    type: String,
    enum: ["Pending", "Paid", "Overdue", "Partial Paid", "Draft", "Canceled"],
  },
  amountPaid: { type: Number, default: 0 },
  dueAmount: { type: Number },
  delete: { type: Boolean, default: false },
  roundOff: { type: Number },
  cancel: { type: Boolean },
  invoiceNumber: { type: String, required: true },
  firm: {
    name: { type: String },
    phone: { type: Number },
    taxId: { type: String },
    address: {
      address1: { type: String },
      address2: { type: String },
      city: { type: String },
      state: { type: String },
      country: { type: String },
      pinCode: { type: Number },
    },
    firmID: { type: mongoose.Schema.Types.ObjectId, ref: "Firm" },
    email: { type: String },
    logo: { type: String },
  },
  payment: [
    {
      amountPaidpayment: { type: Number },
      datePaid: { type: Date },
      paymentMethod: { type: String },
      transId: { type: String },
      notes: { type: String },
      chequeNo: { type: Number },
    },
  ],
  recurringInvoiceObj:{
    // frequency: {
    //   type: String,
    //   required: true
    // },
    // due:{
    //   type: String,
    //   required: true
    // },
    start_date: {
      type: Date,
      // required: true
    },
    end_date: {
      type: Date,
      // required: true
    },
  },
  termsNcondition: [],
  currency: { type: String },
  curConvert: { type: String },
  incluTax: { type: Boolean },
  partialPay: { type: Boolean },
  allowTip: { type: Boolean },
  recurringInvoice: { type: Boolean },
  draft: { type: Boolean },
  orgId: { type: mongoose.Schema.Types.ObjectId, ref: "ORG" }
});

module.exports = mongoose.model("InvoiceModel", InvoiceSchema);
