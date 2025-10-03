// Travel Policy Enforcementimport mongoose from 'mongoose';
const { Schema } = mongoose;

const travelPolicySchema = new Schema({
  policyName: {
    type: String,
    required: true,
    unique: true,
  },
  maxBudget: {
    type: Number,
    required: true,
  },
  allowedModes: [
    {
      type: String,
      enum: ['Air', 'Train', 'Bus', 'Car', 'Other'],
    }
  ],
  applicableTo: {
    type: String,
    enum: ['All', 'Manager', 'Executive', 'Intern', 'Custom'],
    default: 'All',
  },
  internationalApprovalRequired: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: Date,
});

travelPolicySchema.index({ policyName: 1 });

const TravelPolicy = mongoose.model('TravelPolicy', travelPolicySchema);

export default TravelPolicy;
