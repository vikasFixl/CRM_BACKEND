import mongoose from 'mongoose';
const { Schema } = mongoose;

const improvementPlanSchema = new Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmployeeProfile', //  mostly HR will create improvement plan or manager
    required: true,
  },
  planDate: {
    type: Date,
    required: true,
  },
  objectives: [String],
  actions: [String],
  timeline: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['In Progress', 'Completed', 'Delayed'],
    default: 'In Progress',
    index: true,
  },
  managerComments: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

improvementPlanSchema.index({ planDate: 1, status: 1 });

const ImprovementPlan = mongoose.model('ImprovementPlan', improvementPlanSchema);

export default ImprovementPlan;