import mongoose from 'mongoose';
const { Schema } = mongoose;

const travelExpenseSchema = new Schema({
  travelRequest: { type: Schema.Types.ObjectId, ref: 'TravelRequest', required: true },
  employee: { type: Schema.Types.ObjectId, ref: 'EmployeeProfile', required: true },
  category: { type: String, enum: ['Hotel', 'Meal', 'Transport', 'Miscellaneous'], required: true },
  amount: { type: Number, required: true },
  approvedAmount: { type: Number, default: 0 },
  currency: { type: String, default: 'INR' },
  expenseDate: { type: Date, required: true },
  receiptUrl: { type: String, trim: true },
  description: { type: String, trim: true },
  status: { type: String, enum: ['Submitted', 'Approved', 'Rejected'], default: 'Submitted', index: true },
  approver: { type: Schema.Types.ObjectId, ref: 'EmployeeProfile' },
  approvedDate: Date,
  createdBy: { type: Schema.Types.ObjectId, ref: 'EmployeeProfile' },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'EmployeeProfile' },
  deleted: { type: Boolean, default: false },
}, { timestamps: true });

travelExpenseSchema.index({ employee: 1, travelRequest: 1, status: 1 });

export const TravelExpense = mongoose.model('TravelExpense', travelExpenseSchema);
