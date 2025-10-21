

import mongoose from 'mongoose';
const { Schema } = mongoose;

const directDepositSchema = new Schema({
  employee: { type: Schema.Types.ObjectId, ref: 'EmployeeProfile', required: true, index: true },
  bankAccount: { type: Schema.Types.ObjectId, ref: 'BankAccount', required: true }, // reference only
  amount: { type: Schema.Types.Decimal128, required: true }, // use Decimal128 or cents
  currency: { type: String, default: 'INR' },
  transactionId: { type: String, index: true }, // external bank/gateway id
  batchId: { type: Schema.Types.ObjectId, ref: 'PayrollBatch', index: true },
  status: { type: String, enum: ['Pending', 'Initiated', 'Success', 'Failed', 'Reversed'], default: 'Pending', index: true },
  failureReason: String,
  processedAt: Date,
  initiatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  processedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  deleted: { type: Boolean, default: false },
}, { timestamps: true });

// helpful virtual to get amount as number in JS if needed:
// directDepositSchema.virtual('amountNumber').get(function() { return parseFloat(this.amount?.toString() || '0'); });

directDepositSchema.index({ employee: 1, status: 1, batchId: 1 });

export default mongoose.model('DirectDeposit', directDepositSchema);
