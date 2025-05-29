import mongoose, { Schema } from "mongoose";

// const DEFAULT_MODULES = ['leads', 'deals', 'contacts', 'invoices', 'projects', 'hrm'];

const OrganizationSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },

    logo: {
      url: { type: String, trim: true },
      public_id: { type: String, trim: true },
    },

    contactEmail: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
    },
    contactPhone: { type: String, trim: true },

    // Optional password for org (usually better to keep in User model)
    password: { type: String, trim: true, minlength: 6 },

    address: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    country: { type: String, trim: true },

    timezone: { type: String, default: "UTC" },
    fiscalYearStart: { type: Date },

    curConvert: { type: String, trim: true },

    // Add this block for managing organization users and their roles
    users: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        role: { type: String, required: true }, // e.g., 'Admin', 'Manager', 'SupportAgent', etc.
        employeeId: { type: String },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
    modules: { type: [String], default: [] },

    billingPlan: { type: Schema.Types.ObjectId, ref: "BillingPlan" },

    isActive: { type: Boolean, default: true, index: true },
    Archive: { type: Boolean, default: false },
    isdeleted: { type: Boolean, default: false },

    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

OrganizationSchema.index({ name: 1 }, { unique: true });



OrganizationSchema.pre("save", async function (next) {
  if (this.isModified("billingPlan") && this.billingPlan) {
    const BillingPlan = mongoose.model("BillingPlan");
    const plan = await BillingPlan.findById(this.billingPlan);
    if (plan) {
      this.modules = plan.features;
    }
  }
  next();
});

OrganizationSchema.path("contactEmail").validate(function (email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}, "Invalid email format.");


const Org = mongoose.model("Organization", OrganizationSchema);
export default Org;
