const { boolean } = require("joi");
const mongoose = require("mongoose");
const { stringify } = require("querystring");

const InvoiceSchema = new mongoose.Schema({
  items: [
    {
      itemName: { type: String },
      unitPrice: { type: String },
      quantity: { type: String },
      amount: { type: Number },
      // gst: { type: Number },
      // cgst:{type:Number},
      // sgst:{type:Number},
      // igst:{type:Number},
    },
  ],
  gstn: { type: String },
  notes: { type: String },
  remark: { type: String },
  client: {
    firstName: {type: String},
    lastName: {type: String},
    email: { type: String },
    phone: { type: Number },
    address:{
      address1:{type:String},
      address2:{type:String},
      city:{type:String},
      state:{type:String},
      country:{type:String},
      pinCode:{type:Number},
    }
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
  
 firm:{
  name: {type: String},
  phone:{type:Number},
  address:{
    address1:{type:String},
    address2:{type:String},
    city:{type:String},
    state:{type:String},
    country:{type:String},
    pinCode:{type:Number},
  }
 },
  payment:[{
    amountPaidpayment:{type:Number},
    datePaid:{type:Date},
    paymentMethod:{type:String},
    transId:{type:String},
    notes:{type:String},
    chequeNo:{type:Number}
  }],
  termsNcondition:[],
  currency:{type:String},
  partialPay:{type:Boolean},
  allowTip:{type:Boolean},
  draft:{type:Boolean,
  default:false}
});

const InvoiceModel = mongoose.model("InvoiceModel", InvoiceSchema);

module.exports = InvoiceModel;
