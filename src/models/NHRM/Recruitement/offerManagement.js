import mongoose from 'mongoose';
const { Schema } = mongoose;

const offerSchema = new Schema({
  candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
  jobPosting: { type: mongoose.Schema.Types.ObjectId, ref: 'JobPosting', required: true },
  position: { type: mongoose.Schema.Types.ObjectId, ref: 'Position', required: true },
  offerDate: { type: Date, required: true },
  acceptedDate: Date,
  status: { type: String, enum: ['Pending', 'Accepted', 'Rejected'], default: 'Pending', index: true },
 offerDetails: {
  baseSalary: { type: Number, required: true },
  bonus: { type: Number, default: 0 },
  currency: { type: String, default: 'INR' },
  payFrequency: { type: String, enum: ['Monthly', 'Annually'], default: 'Monthly' },
  benefits: [String],
  jobTitle: String,
  location: String,
}
,
  signedDocumentUrl: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

offerSchema.index({ offerDate: 1, status: 1 });

export const Offer = mongoose.model('Offer', offerSchema);