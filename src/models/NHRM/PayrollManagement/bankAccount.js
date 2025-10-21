import mongoose from 'mongoose';
const { Schema } = mongoose;

/**
 * BankAccount stored separately. Only store masked/last4 and an encrypted or hashed token for the real account.
 * For production, store the real sensitive data in a vault/KMS or encrypted field.
 */
const bankAccountSchema = new Schema({
  employee: { type: Schema.Types.ObjectId, ref: 'EmployeeProfile', required: true, index: true },
  bankName: { type: String, required: true, trim: true },
  // DO NOT store plaintext account numbers in logs. Consider encrypting before save.
  accountNumberHash: { type: String, required: true }, // hash/encrypted token of account number
  accountLast4: { type: String, maxlength: 4 }, // user-friendly mask field
  routingNumber: { type: String, trim: true },
  ifscCode: { type: String, trim: true, uppercase: true, match: /^[A-Z]{4}0[A-Z0-9]{6}$/ }, // basic IFSC
  swiftCode: { type: String, trim: true, uppercase: true, match: /^[A-Z0-9]{8,11}$/ }, // basic SWIFT
  isPrimary: { type: Boolean, default: false },
  accountType: { type: String, enum: ['Checking', 'Savings', 'Current', 'Other'], default: 'Savings' },
  status: { type: String, enum: ['Active', 'Inactive', 'Archived'], default: 'Active', index: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  deleted: { type: Boolean, default: false },
}, { timestamps: true });

bankAccountSchema.index({ employee: 1, isPrimary: 1 });

export default mongoose.model('BankAccount', bankAccountSchema);