import mongoose from 'mongoose';
const { Schema } = mongoose;

const goalSettingSchema = new Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmployeeProfile',
    required: true,
  },
  goal: {
    type: String,
    required: true,
  },
  keyPerformanceIndicators: [String], // Array of KPIs
  targetDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['In Progress', 'Completed', 'Delayed'],
    default: 'In Progress',
    index: true,
  },
  progress: {
    type: Number, // Percentage of completion
    default: 0,
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

goalSettingSchema.index({ targetDate: 1, status: 1 });

const GoalSetting = mongoose.model('GoalSetting', goalSettingSchema);

export default GoalSetting;