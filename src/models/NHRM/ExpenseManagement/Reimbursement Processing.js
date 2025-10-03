// Reimbursement Processingimport mongoose from 'mongoose';
const { Schema } = mongoose;

const reimbursementSchema = new Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmployeeProfile',
    required: true,
  },
  expenses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ExpenseSubmission',
    }
  ],
  totalAmount: {
    type: Number,
    required: true,
  },
  reimbursementDate: {
    type: Date,
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: ['Bank Transfer', 'Cash', 'Cheque', 'Other'],
    required: true,
  },
  paymentReference: String,
  status: {
    type: String,
    enum: ['Pending', 'Processed', 'Failed'],
    default: 'Pending',
    index: true,
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmployeeProfile',
  },
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

reimbursementSchema.index({ employee: 1, status: 1, reimbursementDate: -1 });

const Reimbursement = mongoose.model('Reimbursement', reimbursementSchema);

export default Reimbursement;
