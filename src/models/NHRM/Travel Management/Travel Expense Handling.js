// Travel Expense Handlingimport mongoose from 'mongoose';
const { Schema } = mongoose;

const travelExpenseSchema = new Schema({
  travelRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TravelRequest',
    required: true,
  },
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmployeeProfile',
    required: true,
  },
  category: {
    type: String,
    enum: ['Hotel', 'Meal', 'Transport', 'Miscellaneous'],
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
  receiptUrl: String,
  description: String,
  status: {
    type: String,
    enum: ['Submitted', 'Approved', 'Rejected'],
    default: 'Submitted',
    index: true,
  },
  approver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmployeeProfile',
  },
  approvedDate: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

travelExpenseSchema.index({ employee: 1, travelRequest: 1, status: 1 });

const TravelExpense = mongoose.model('TravelExpense', travelExpenseSchema);

export default TravelExpense;
