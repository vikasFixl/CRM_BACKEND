// Expense Submission & Trackingimport mongoose from 'mongoose';
const { Schema } = mongoose;

const expenseSubmissionSchema = new Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmployeeProfile',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    enum: ['Travel', 'Food', 'Accommodation', 'Office Supplies', 'Training', 'Other'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  expenseDate: {
    type: Date,
    required: true,
  },
  description: String,
  receiptUrl: String, // Cloud/file URL
  status: {
    type: String,
    enum: ['Submitted', 'Under Review', 'Approved', 'Rejected', 'Paid'],
    default: 'Submitted',
    index: true,
  },
  approver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmployeeProfile',
  },
  reimbursementId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reimbursement',
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

expenseSubmissionSchema.index({ employee: 1, status: 1, expenseDate: -1 });

const ExpenseSubmission = mongoose.model('ExpenseSubmission', expenseSubmissionSchema);

export default ExpenseSubmission;
