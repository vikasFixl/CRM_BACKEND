import mongoose from "mongoose";

const ContactPersonSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String },
    address1: { type: String },
    address2: { type: String },
    city: { type: String },
    state: { type: String },
    pinCode: { type: Number },
    country: { type: String },
    phone: { type: Number },
    mobile: { type: Number },
    altPhone: { type: Number },
    altMobile: { type: Number },
  },
  { _id: false }
);

const ClientSchema = new mongoose.Schema(
  {
    clientFirmName: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    website: { type: String },
    email: { type: String, required: true },
    phone: { type: Number, required: true },
    add: {
      type: Object,
      required: true,
    },
    contectPerson: ContactPersonSchema,
    taxId: { type: String },
    tinNo: { type: String },
    cinNo: { type: String },
    orgId: { type: mongoose.Schema.Types.ObjectId, ref: "ORG" },
    firmId: { type: mongoose.Schema.Types.ObjectId, ref: "Firm" },
  },
  {
    timestamps: true,
  }
);

const ClientModel = mongoose.model("ClientModel", ClientSchema);
export default ClientModel;
