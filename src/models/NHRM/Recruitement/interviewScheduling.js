import mongoose from 'mongoose';
const { Schema } = mongoose;

const interviewSchema = new Schema({
  candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
  jobPosting: { type: mongoose.Schema.Types.ObjectId, ref: 'JobPosting', required: true },
  interviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'EmployeeProfile', required: true },
  scheduledDate: { type: Date, required: true },
  interviewType: { type: String, enum: ['Phone', 'Video', 'In-person'], default: 'Phone' },
  panel: [{ type: mongoose.Schema.Types.ObjectId, ref: 'EmployeeProfile' }],
  status: { type: String, enum: ['Scheduled', 'Completed', 'Cancelled'], default: 'Scheduled', index: true },
  feedback: String,
  rating: { type: Number, min: 1, max: 5 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  followUp: String, // Follow-up actions or notes
});

interviewSchema.index({ scheduledDate: 1, status: 1 });

export default mongoose.model('Interview', interviewSchema);