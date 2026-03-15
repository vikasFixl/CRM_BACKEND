import mongoose, { Schema } from "mongoose";

/**
 * Payment method sub-schema
 */
const PaymentMethodSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["credit_card", "paypal", "bank_transfer", "other", "trialing"],
      required: true,
    },
    details: { type: Schema.Types.Mixed }, // Flexible for now
    isDefault: { type: Boolean, default: false },
  },
  { _id: false }
);


 
const OrganizationBillingSchema = new Schema(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      unique: true,
      index: true,
    },

    billingPlanId: {
      type: Schema.Types.ObjectId,
      ref: "BillingPlan",
      required: true,
    },

    // Snapshot of plan at time of subscription
    planSnapshot: {
      name: { type: String, required: true },
      code: { type: String, required: true },
      planType: {
        type: String,
        enum: ["FREE", "BASIC", "PRO", "ENTERPRISE"],
        required: true,
      },
      price: { type: Number, required: true },
      billingCycle: { type: String, enum: ["monthly", "quarterly", "yearly"], required: true },
      features: { type: [String], default: [] },
      limits: { type: Schema.Types.Mixed },
    },

    subscriptionStartDate: { type: Date, default: Date.now },
    subscriptionEndDate: { type: Date },
    lastPaymentDate: { type: Date },
    nextPaymentDate: { type: Date },
    gracePeriodEndDate: { type: Date },
    paymentStatus: {
  type: String,
  enum: ["free", "trialing", "active", "past_due", "canceled"],
  default: "free",
  index: true,
}

,
    trialEndDate: { type: Date },
    autoRenew: { type: Boolean, default: true },
    currency: { type: String, enum: ["USD", "EUR", "INR", "GBP"], default: "USD" },

    // coupon: CouponSchema,
    paymentMethods: { type: [PaymentMethodSchema], default: [] },

    billingAddress: {
      line1: { type: String, trim: true },
      line2: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      zip: { type: String, trim: true },
      country: { type: String, trim: true },
    },

    invoiceSettings: {
      sendInvoiceEmail: { type: Boolean, default: true },
      invoiceEmail: {
        type: String,
        trim: true,
        validate: {
          validator: (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
          message: "Invalid email format",
        },
      },
      taxRate: { type: Number, min: 0, max: 100, default: 0 },
    },

    metadata: { type: Map, of: String },

    addOns: [
  {
    moduleCode: {
      type: String,
      uppercase: true,
      required: true
    },

    pricingSnapshot: {
      currency: { type: String, required: true },
      amount: { type: Number, required: true },
      billingCycle: {
        type: String,
        enum: ["monthly", "quarterly", "yearly"],
        required: true
      }
    },

    activatedAt: { type: Date, default: Date.now },
    deactivatedAt: { type: Date },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active"
    }
  }
]
,

    isDeleted: { type: Boolean, default: false },
status: { type: String, enum: ["active", "inactive"], default: "active", index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

/**
 * Ensure only one default payment method
 */
OrganizationBillingSchema.pre("save", function (next) {
  if (this.paymentMethods && this.paymentMethods.length > 0) {
    const defaults = this.paymentMethods.filter((pm) => pm.isDefault);
    if (defaults.length > 1) {
      let found = false;
      this.paymentMethods = this.paymentMethods.map((pm) => {
        if (pm.isDefault && !found) {
          found = true;
          return pm;
        }
        pm.isDefault = false;
        return pm;
      });
    }
  }
  next();
});

export const OrganizationBilling = mongoose.model(
  "OrganizationBilling",
  OrganizationBillingSchema
);
