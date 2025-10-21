import mongoose from 'mongoose';
const { Schema } = mongoose;

const travelPolicySchema = new Schema({
  policyName: { type: String, required: true, unique: true, trim: true },
  maxBudget: { type: Number, required: true },
  maxPerCategory: {
    Hotel: { type: Number, default: 0 },
    Meal: { type: Number, default: 0 },
    Transport: { type: Number, default: 0 },
    Miscellaneous: { type: Number, default: 0 },
  },
  allowedModes: [{ type: String, enum: ['Air', 'Train', 'Bus', 'Car', 'Other'] }],
  applicableTo: { type: String, enum: ['All', 'Manager', 'Executive', 'Intern', 'Custom'], default: 'All' },
  internationalApprovalRequired: { type: Boolean, default: true },
  active: { type: Boolean, default: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'EmployeeProfile' },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'EmployeeProfile' },
}, { timestamps: true });

travelPolicySchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export const TravelPolicy = mongoose.model('TravelPolicy', travelPolicySchema);
