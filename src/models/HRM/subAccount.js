const mongoose = require('mongoose');

const subAccountSchema = new mongoose.Schema(
  {
    name: { type: String, unique: true },
    account: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
    debit: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' }],
    credit: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' }],
    status: { type: Boolean, default: true },
  },
  {
    timestamps: true, // Enable timestamps
  }
);

const SubAccount = mongoose.model('SubAccount', subAccountSchema);

module.exports = SubAccount;
