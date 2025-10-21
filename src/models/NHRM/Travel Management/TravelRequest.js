import mongoose from 'mongoose';
const { Schema } = mongoose;

const travelRequestSchema = new Schema({
  employee: { type: Schema.Types.ObjectId, ref: 'EmployeeProfile', required: true },
  destination: { type: String, required: true, trim: true },
  purpose: { type: String, required: true, trim: true },
  travelType: { type: String, enum: ['Domestic', 'International'], required: true },
  departureDate: { type: Date, required: true },
  returnDate: { type: Date, required: true },
  modeOfTransport: { type: String, enum: ['Air', 'Train', 'Bus', 'Car', 'Other'], required: true },
  estimatedCost: { type: Number, default: 0 },
  travelPolicy: { type: Schema.Types.ObjectId, ref: 'TravelPolicy' },
  travelPolicyMatched: { type: Boolean, default: true },
  policyReason: { type: String, trim: true },
  status: {
    type: String,
    enum: ['Submitted', 'PendingApproval', 'Approved', 'Rejected', 'Cancelled', 'Completed'],
    default: 'Submitted',
    index: true,
  },
  approver: { type: Schema.Types.ObjectId, ref: 'EmployeeProfile' },
  approvedDate: Date,
  notes: { type: String, trim: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'EmployeeProfile' },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'EmployeeProfile' },
  deleted: { type: Boolean, default: false },
}, { timestamps: true });

travelRequestSchema.index({ employee: 1, status: 1, destination: 1 });

export const TravelRequest = mongoose.model('TravelRequest', travelRequestSchema);
