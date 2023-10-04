const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    date: Date,
    debit: { type: mongoose.Schema.Types.ObjectId, ref: 'SubAccount' },
    credit: { type: mongoose.Schema.Types.ObjectId, ref: 'SubAccount' },
    particulars: String,
    amount: Number,
    type: String,
    related_id: Number,
    status: { type: Boolean, default: true },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, // Enable custom timestamps
  }
);

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
