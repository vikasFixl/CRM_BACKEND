const mongoose = require('mongoose');
const { logPurchase } = require('../Activitylogger/activitylogger');

const PurchesSchema = new mongoose.Schema({
  items: [
    {
      itemName: { type: String },
      unitPrice: { type: String },
      quantity: { type: String },
      amount: { type: Number },
      hsn: { type: String },
      sac: { type: String },
      taxRate: { type: String },
      desc: { type: String },
      discount: { type: Number },
    },
  ],
  gstn: { type: String },
  notes: { type: String },
  remark: { type: String },
  vendor: {
    name: String,
    email: String,
    phone: Number,
    taxId: String,
    address: {
      address1: String,
      address2: String,
      city: String,
      state: String,
      country: String,
      pinCode: Number
    },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "vendorId" }
  },
  tax: { type: Array },
  taxAmt: { type: Array },
  subTotal: { type: Number },
  total: { type: Number },
  orderDate: { type: Date },
  deliveryDate: { type: Date },
  status: {
    type: String,
    enum: ["Pending", "Paid", "Overdue", "Partial Paid", "Draft", "Canceled"],
  },
  amountPaid: { type: Number, default: 0 },
  dueAmount: { type: Number },
  delete: { type: Boolean, default: false },
  roundOff: { type: Number },
  cancel: { type: Boolean },
  purchaseNumber: { type: String, required: true },
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
  termsNcondition: [],
  currency: { type: String },
  curConvert: { type: String },
  incluTax: { type: Boolean },
  partialPay: { type: Boolean },
  allowTip: { type: Boolean },
  recurringPurchase: {
    isEnabled: { type: Boolean },
    frequncy: { type: Number },
    end_date: { type: Date },
  },
  draft: { type: Boolean },
  orgId: { type: mongoose.Schema.Types.ObjectId, ref: "ORG" },
});

// Hook to log when a new purchase is created
PurchesSchema.pre('save', function (next) {
  // Log the purchase creation
  logPurchase(`New purchase created with purchaseNumber: ${this.purchaseNumber}`);
  next();
});

// Hook to log when the status changes
PurchesSchema.pre('updateOne', function (next) {
  // Log the status change
  logPurchase(`Purchase with purchaseNumber: ${this.getQuery().purchaseNumber} status changed to: ${this._update.status}`);
  next();
});

module.exports = mongoose.model('PurchesModel', PurchesSchema);
