const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  // User associated with the subscription
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ORG',
    required: true,
  },
  // Subscription plan details
  planName: {
    type: String,
    enum:["Free","Medium","Premium"],
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  // Payment details (you can expand this as needed)
  paymentMethod: {
    type: String,
    required: true,
  },
  transactionId: {
    type: String,
    required: true,
  },
  // Additional subscription information
  isActive: {
    type: Boolean,
    default: true, // You can set this to false if the subscription is inactive
  },
  // Add other fields specific to your subscription model
}, {
  timestamps: true, // Adds createdAt and updatedAt timestamps
});

module.exports = mongoose.model('Subscription', subscriptionSchema);

