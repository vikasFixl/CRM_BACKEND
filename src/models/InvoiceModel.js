import mongoose from "mongoose";
const { Schema, model, models } = mongoose; 
export const itemSchema = new mongoose.Schema(
  {
    itemName: { type: String, required: true },
    unitPrice: { type: Number, required: true },
    quantity: { type: Number, required: true },
    amount: { type: Number },
    hsn: { type: String },
    sac: { type: String },
    taxRate: { type: Number, required: true },
    desc: { type: String },
    discount: { type: Number },
  },
  { _id: false }
);
export const addressSchema = new mongoose.Schema(
  {
    address1: { type: String },
    address2: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    pinCode: { type: Number },
  },
  { _id: false }
); // prevent creating _id for nested docs
export const clientSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: Number, required: true },
    taxId: { type: String },
    clientFirmName: { type: String },
    address: { type: addressSchema, required: true },
    client_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ClientModel",
      required: true,
    },
  },
  { _id: false }
);


export const paymentSchema = new mongoose.Schema({
  amountPaid: { type: Number },
  datePaid: { type: Date },
  paymentMethod: { type: String },
  transId: { type: String },
  notes: { type: String },
  chequeNo: { type: Number },
}, { _id: false });


export const firmInfoSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: Number },
    taxId: { type: String },
    email: { type: String, required: true },
    address: { type: addressSchema },
    firmId: { type: mongoose.Schema.Types.ObjectId, ref: "Firm", required: true },
    logo: {
      url: { type: String },
      public_id: { type: String },
    },

  },
  { _id: false }
);
const InvoiceSchema = new mongoose.Schema({
  // References
  orgId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
    required: true,
  },
  // Core fields
  invoiceNumber: { type: String, required: true, index: true },
  invoiceDate: { type: Date, required: true },
  dueDate: { type: Date, required: true },
  subTotal: { type: Number, required: true },
  total: { type: Number, required: true },

  // Flags & status
  status: {
    type: String,
    enum: ["Pending", "Paid", "Overdue", "Partial Paid", "Draft", "Canceled"],
    default: "Draft",
  },
  amountPaid: { type: Number, default: 0 },
  dueAmount: { type: Number },
  roundOff: { type: Number },
  delete: { type: Boolean, default: false },
  cancel: { type: Boolean, default: false },
  draft: { type: Boolean, default: false },
  incluTax: { type: Boolean },
  partialPay: { type: Boolean },
  allowTip: { type: Boolean },
  recurringInvoice: { type: Boolean },

  // Detailed sections
  items: [itemSchema],
  tax: { type: Array },
  taxAmt: { type: Array },
  notes: { type: String },
  remark: { type: String },
  gstn: { type: String },
  termsNcondition: [{ type: String }],
  currency: { type: String },
  curConvert: { type: String },

  // Embedded docs
  client: clientSchema,
  firm: firmInfoSchema,
  payment: [paymentSchema],

  recurringInvoiceObj: {
    start_date: { type: Date },
    end_date: { type: Date },
  },
},
  { timestamps: true });

InvoiceSchema.index({ invoiceDate: 1, orgId: 1,draft: 1,delete: 1,cancel: 1 }, { unique: false });

// ✅ Avoid OverwriteModelError
const InvoiceModel = models.InvoiceModel || model("InvoiceModel", InvoiceSchema);
export default InvoiceModel;
