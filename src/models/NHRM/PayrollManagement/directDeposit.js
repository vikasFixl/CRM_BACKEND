import mongoose from 'mongoose';
const { Schema } = mongoose;

const directDepositSchema = new Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmployeeProfile',
    required: true,
  },
  bankName: {
    type: String,
    required: true,
  },
  accountNumber: {
    type: String,
    required: true,
  },
  routingNumber: {
    type: String,
    required: true,
  },
  ifscCode: String, // Indian Financial System Code
  swiftCode: String, // Society for Worldwide Interbank Financial Telecommunication Code
  isPrimaryAccount: {
    type: Boolean,
    default: true,
  },
  accountType: {
    type: String,
    enum: ['Checking', 'Savings'],
    required: true,
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active',
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

directDepositSchema.index({ status: 1 });

const DirectDeposit = mongoose.model('DirectDeposit', directDepositSchema);

export default DirectDeposit;