import mongoose from 'mongoose';
const { Schema } = mongoose;

const jobPostingSchema = new Schema({
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Org', required: true, index: true },
  title: { type: String, required: true, trim: true, index: true },
  description: { type: String, required: true },
  qualifications: [String],
  responsibilities: [String],
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true, index: true },
  position: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Position",
    required: true,
    index: true,
  },
  openingCount: { type: Number, default: 1 },

  location: { type: String, required: true },
  employmentType: { type: String, enum: ['Full-Time', 'Part-Time', 'Contract', 'Internship'], default: 'Full-Time' },
  tags: [String],
  status: { type: String, enum: ['Open', 'Closed', 'Filled'], default: 'Open', index: true },
  postedDate: { type: Date, default: Date.now },
  closingDate: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
},{ timestamps: true });

jobPostingSchema.index({ title: 1, status: 1 });

export const JobPosting = mongoose.model('JobPosting', jobPostingSchema);