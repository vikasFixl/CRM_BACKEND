import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const assetAssignmentSchema = new Schema(
  {
    assetName: { type: String, required: true },
    assetType: { type: String, enum: ['Laptop', 'Mobile', 'Monitor', 'Chair', 'Other'], required: true },
    serialNumber: { type: String, required: true }, // uniqueness handled by compound index
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'EmployeeProfile', default: null },
    assignmentDate: Date,
    returnDate: Date,
    status: { type: String, enum: ['Assigned', 'Returned', 'Lost', 'Damaged'], default: 'Assigned' },
    condition: { type: String, enum: ['New', 'Good', 'Needs Repair', 'Retired'], default: 'Good' },
    notes: String,
  },
  { timestamps: true }
);

// Ensure unique serial per organization
assetAssignmentSchema.index({ serialNumber: 1, organizationId: 1 }, { unique: true });

const AssetAssignment = model('AssetAssignment', assetAssignmentSchema);
export default AssetAssignment;
