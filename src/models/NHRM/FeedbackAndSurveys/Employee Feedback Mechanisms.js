// Employee Feedback Mechanismsimport mongoose from 'mongoose';
const { Schema } = mongoose;

const employeeFeedbackSchema = new Schema({
  employee:   { type: mongoose.Schema.Types.ObjectId, ref: 'EmployeeProfile', sparse: true }, // optional for anonymity
  category:   { type: String, enum: ['Work Environment', 'Management', 'Compensation', 'Career Growth', 'Other'], required: true },
  message:    { type: String, required: true },
  sentiment:  { type: String, enum: ['Positive', 'Neutral', 'Negative'], default: 'Neutral' },
  isAnonymous:{ type: Boolean, default: false },
  createdAt:  { type: Date, default: Date.now },
  updatedAt:  { type: Date, default: Date.now }
});

employeeFeedbackSchema.index({ category: 1, createdAt: 1 });

export default mongoose.model('EmployeeFeedback', employeeFeedbackSchema);