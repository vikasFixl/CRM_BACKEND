import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  address1: String,
  address2: String,
  city: String,
  state: String,
  pinCode: Number,
  country: String,
});

const contactPersonSchema = new mongoose.Schema({
  name: String,
  email: String,
  address1: String,
  address2: String,
  city: String,
  state: String,
  pinCode: Number,
  country: String,
  phone: Number,
  mobile: Number,
  altPhone: Number,
  altMobile: Number,
});

const ClientSchema = new mongoose.Schema(
  {
    clientFirmName: String,
    firstName: String,
    lastName: String,
    website: String,
    email: { type: String, required: true },
    phone: { type: Number, required: true },
    address: addressSchema,
    contactPerson: contactPersonSchema,
    taxId: String,
    tinNo: String,
    cinNo: String,
    orgId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization" ,required: true},
    firmId: { type: mongoose.Schema.Types.ObjectId, ref: "Firm" ,required: true},
    deleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

ClientSchema.index({ orgId: 1, email: 1, firmId: 1 });
const ClientModel = mongoose.model("ClientModel", ClientSchema);
export default ClientModel;
