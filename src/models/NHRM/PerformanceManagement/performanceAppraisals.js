import mongoose from 'mongoose';
const { Schema } = mongoose;

const performanceAppraisalSchema = new Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmployeeProfile',
    required: true,
  },
  appraisalDate: {
    type: Date,
    required: true,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true,
  },
  comments: String,
  managerComments: String,
  status: {
    type: String,
    enum: ['Pending', 'Completed'],
    default: 'Pending',
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

performanceAppraisalSchema.index({ appraisalDate: 1, status: 1 });

const PerformanceAppraisal = mongoose.model('PerformanceAppraisal', performanceAppraisalSchema);

export default PerformanceAppraisal;