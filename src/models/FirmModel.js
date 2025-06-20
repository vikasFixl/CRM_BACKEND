import mongoose from "mongoose";

const firmSchema = new mongoose.Schema(
  {
    FirmName: { type: String, required: true },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    FirmLogo: {
      url: {
        type: String,
        default:
          "https://res.cloudinary.com/dnctmzmmx/image/upload/v1750401124/user/rvblg8czxgpg9qtap3rv.webp",
      },
      public_id: {
        type: String,
        default: null, // optional
      },
    },
    invoicePrefix: {
      type: String,
      required: true,
    },
    add: {
      address1: { type: String },
      address2: { type: String },
      city: { type: String },
      state: { type: String },
      country: { type: String },
      pinCode: { type: Number },
    },
    contectPerson: {
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
    website: { type: String },
    gst_no: { type: String },
    logo: { type: String },
    uin: { type: String },
    tinNo: { type: String },
    cinNo: { type: String },
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Oraganization",
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);
firmSchema.index({ orgId: 1, email: 1 }, { unique: true });
firmSchema.index({ orgId: 1, name: 1 }, { unique: true });
mongoose.models.Firm && delete mongoose.models.Firm;
const Firm = mongoose.model("Firm", firmSchema);
export default Firm;
