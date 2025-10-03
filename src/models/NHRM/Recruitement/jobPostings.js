import mongoose from 'mongoose';
const { Schema } = mongoose;

const jobPostingSchema = new Schema({
  title: { type: String, required: true, trim: true, index: true },
  description: { type: String, required: true },
  qualifications: [String],
  responsibilities: [String],
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true, index: true },
  location: { type: String, required: true },
  employmentType: { type: String, enum: ['Full-Time', 'Part-Time', 'Contract', 'Internship'], default: 'Full-Time' },
  tags: [String],
  status: { type: String, enum: ['Open', 'Closed', 'Filled'], default: 'Open', index: true },
  postedDate: { type: Date, default: Date.now },
  closingDate: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  applications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Candidate' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

jobPostingSchema.index({ title: 1, status: 1 });

export default mongoose.model('JobPosting', jobPostingSchema);