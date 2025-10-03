import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const resourceAvailabilitySchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    totalAssets: { type: Number, default: 0 },
    assetsAssigned: { type: Number, default: 0 },
    assetsAvailable: { type: Number, default: 0 },
    totalDesks: { type: Number, default: 0 },
    desksOccupied: { type: Number, default: 0 },
    desksAvailable: { type: Number, default: 0 },
    reportDate: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

resourceAvailabilitySchema.index({ organizationId: 1, reportDate: -1 });

const ResourceAvailability = model('ResourceAvailability', resourceAvailabilitySchema);
export default ResourceAvailability;
