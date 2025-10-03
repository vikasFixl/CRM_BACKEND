import mongoose from 'mongoose';
const { Schema } = mongoose;

const offerSchema = new Schema({
  candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
  jobPosting: { type: mongoose.Schema.Types.ObjectId, ref: 'JobPosting', required: true },
  offerDate: { type: Date, required: true },
  acceptedDate: Date,
  status: { type: String, enum: ['Pending', 'Accepted', 'Rejected'], default: 'Pending', index: true },
  offerDetails: {
    baseSalary: Number,
    bonus: Number,
    benefits: String,
    jobTitle: String, // Title of the position being offered
    location: String, // Location of the position being offered
  },
  signedDocumentUrl: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

offerSchema.index({ offerDate: 1, status: 1 });

export default mongoose.model('Offer', offerSchema);