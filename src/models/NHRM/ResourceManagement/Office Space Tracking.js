import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const officeSpaceSchema = new Schema(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    building: String,
    floor: String,
    roomNumber: String,
    deskNumber: String,
    assignedTo: { type: Schema.Types.ObjectId, ref: 'EmployeeProfile', default: null },
    status: { type: String, enum: ['Available', 'Occupied', 'Under Maintenance'], default: 'Available', index: true },
    capacity: { type: Number, default: 1 },
    notes: String,
  },
  { timestamps: true }
);

// Optional compound index to quickly find available desks in building/floor
officeSpaceSchema.index({ building: 1, floor: 1, status: 1 });

const OfficeSpace = model('OfficeSpace', officeSpaceSchema);
export default OfficeSpace;
