// Action Plan Trackingimport mongoose from 'mongoose';
const { Schema } = mongoose;

const actionPlanSchema = new Schema({
  survey:       { type: mongoose.Schema.Types.ObjectId, ref: 'SurveyDelivery', required: true },
  title:        { type: String, required: true, trim: true, index: true },
  description:  String,
  owner:        { type: mongoose.Schema.Types.ObjectId, ref: 'EmployeeProfile', required: true },
  dueDate:      { type: Date, required: true },
  priority:     { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
  status:       { type: String, enum: ['Not Started', 'In Progress', 'Completed'], default: 'Not Started', index: true },
  progress:     { type: Number, min: 0, max: 100, default: 0 },
  notes:        String,
  createdAt:    { type: Date, default: Date.now },
  updatedAt:    { type: Date, default: Date.now }
});

actionPlanSchema.index({ dueDate: 1, status: 1 });

export default mongoose.model('ActionPlan', actionPlanSchema);