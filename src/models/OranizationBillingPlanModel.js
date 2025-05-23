import mongoose, { Schema } from 'mongoose';

const OrganizationBillingSchema = new Schema({
  organizationId: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    unique: true,
    index: true
  },
  billingPlanId: {
    type: Schema.Types.ObjectId,
    ref: 'BillingPlan',
    required: true
  },
  subscriptionStartDate: { type: Date, default: Date.now },
  subscriptionEndDate: { type: Date },
  lastPaymentDate: { type: Date },
  nextPaymentDate: { type: Date },
  paymentStatus: {
    type: String,
    enum: ['active', 'past_due', 'canceled', 'trialing'],
    default: 'trialing'
  },
  trialEndDate: { type: Date },
  autoRenew: { type: Boolean, default: true },
  couponCode: { type: String },
  paymentMethod: {
    type: {
      type: String,
      enum: ['credit_card', 'paypal', 'bank_transfer', 'other','trialing'],
      required: true
    },
    details: { type: Schema.Types.Mixed }
  },
  billingAddress: {
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    zip: { type: String, trim: true },
    country: { type: String, trim: true }
  },
  invoiceSettings: {
    sendInvoiceEmail: { type: Boolean, default: true },
    invoiceEmail: { type: String, trim: true },
    taxRate: { type: Number, default: 0 }
  },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export const OrganizationBilling = mongoose.model('OrganizationBilling', OrganizationBillingSchema);