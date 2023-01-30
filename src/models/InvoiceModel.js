const mongoose = require("mongoose");
const { stringify } = require("querystring");

const InvoiceSchema = new mongoose.Schema({
  items: [
    {
      itemName: { type: String },
      unitPrice: { type: String },
      quantity: { type: String },
      amount: { type: Number },
      gst: { type: Number },
      cgst:{type:Number},
      sgst:{type:Number},
      igst:{type:Number},
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

  gst: { type: Number },
  cgst:{type:Number},
  sgst:{type:Number},
  igst:{type:Number},
  subTotal: { type: Number },
  total: { type: Number },
  invoiceDate: { type: Date },
  dueDate: { type: Date },
  status: { type: String },
  amountPaid:{type:Number,default:0},
  dueAmount:{type:Number,default:0},
  delete: { type: Boolean },
  invoiceNumber: { type: Number },
  
  selectFirm:{type:String},
  firmEmail:{type:String},
  payment:[{
    amountPaidpayment:{type:Number},
    datePaid:{type:Date},
    paymentMethod:{type:String},
    transId:{type:String},
    notes:{type:String},
    chequeNo:{type:Number}
  }]
});

const InvoiceModel = mongoose.model("InvoiceModel", InvoiceSchema);

module.exports = InvoiceModel;
