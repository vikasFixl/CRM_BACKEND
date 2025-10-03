import mongoose from 'mongoose';
const { Schema } = mongoose;

const candidateSchema = new Schema({
  firstName: { type: String, required: true, trim: true, index: true },
  lastName: { type: String, required: true, trim: true, index: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true, index: true },
  phoneNumber: { type: String, unique: true, trim: true, index: true },
  resume: String, // URL to resume
  coverLetter: String, // URL to cover letter
  jobApplication: { type: mongoose.Schema.Types.ObjectId, ref: 'JobPosting', required: true },
  source: { type: String, enum: ['LinkedIn', 'Indeed', 'Referral', 'Walk-in', 'Other'], default: 'Other' },
  interviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Interview' }],
  offer: { type: mongoose.Schema.Types.ObjectId, ref: 'Offer' },
  status: { type: String, enum: ['Applied', 'Interview Scheduled', 'Offered', 'Rejected', 'Hired'], default: 'Applied', index: true },
  appliedDate: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isArchived: { type: Boolean, default: false },
  notes: [String], // Additional notes about the candidate
});

candidateSchema.index({ firstName: 1, lastName: 1, status: 1 });

export default mongoose.model('Candidate', candidateSchema);