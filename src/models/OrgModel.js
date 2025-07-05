import mongoose, { Schema } from "mongoose";

const OrganizationSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },

    OrgLogo: {
      url: {
        type: String,
        trim: true,
        default:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSBix1vtUBBRZ6pP3ASr0573t9-UPW8D5eiNA&s",
      },
      public_id: { type: String, trim: true, default: null },
    },

    contactEmail: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
      validate: {
        validator: function (email) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(email);
        },
        message: "Invalid email format.",
      },
    },

    contactPhone: { type: String, trim: true },
    contactName: { type: String, trim: true },

    password: { type: String, trim: true, minlength: 6 },

    address: { type: String, trim: true },
    orgCity: { type: String, trim: true },
    orgState: { type: String, trim: true },
    orgCountry: { type: String, trim: true },

    timezone: { type: String, default: "UTC" },
    fiscalYearStart: { type: Date },
    curConvert: { type: String, trim: true },

    modules: { type: [String], default: [] },

    billingPlan: { type: Schema.Types.ObjectId, ref: "BillingPlan" },

    isActive: { type: Boolean, default: true, index: true },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },

    deletedAt: { type: Date },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    isSuspended: {
      type: Boolean,
      default: false,
      select: false,
    },
  },
  { timestamps: true }
);

OrganizationSchema.index({ name: 1 }, { unique: true });
OrganizationSchema.index({ contactEmail: 1 }, { unique: true });
OrganizationSchema.index({ isDeleted: 1 });
OrganizationSchema.index({ billingPlan: 1 });

OrganizationSchema.pre("save", async function (next) {
  if (this.isModified("billingPlan") && this.billingPlan) {
    const BillingPlan = mongoose.model("BillingPlan");
    const plan = await BillingPlan.findById(this.billingPlan);
    if (plan) {
      this.modules = plan.modules;
    }
  }
  next();
});

const Org = mongoose.model("Organization", OrganizationSchema);
export default Org;
