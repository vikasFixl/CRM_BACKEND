// Travel Requests & Approvalsimport mongoose from 'mongoose';
const { Schema } = mongoose;

const travelRequestSchema = new Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmployeeProfile',
    required: true,
  },
  destination: {
    type: String,
    required: true,
  },
  purpose: {
    type: String,
    required: true,
  },
  travelType: {
    type: String,
    enum: ['Domestic', 'International'],
    required: true,
  },
  departureDate: {
    type: Date,
    required: true,
  },
  returnDate: {
    type: Date,
    required: true,
  },
  modeOfTransport: {
    type: String,
    enum: ['Air', 'Train', 'Bus', 'Car', 'Other'],
  },
  estimatedCost: Number,
  travelPolicyMatched: {
    type: Boolean,
    default: true,
  },
  status: {
    type: String,
    enum: ['Submitted', 'Approved', 'Rejected', 'Cancelled'],
    default: 'Submitted',
    index: true,
  },
  approver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmployeeProfile',
  },
  approvedDate: Date,
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

travelRequestSchema.index({ employee: 1, destination: 1, status: 1 });

const TravelRequest = mongoose.model('TravelRequest', travelRequestSchema);

export default TravelRequest;
