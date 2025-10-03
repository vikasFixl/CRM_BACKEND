import mongoose from 'mongoose';
const { Schema } = mongoose;

const policyDocumentSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  documentType: {
    type: String,
    enum: ['Policy', 'Procedure', 'Guideline'],
    required: true,
  },
  documentContent: {
    type: String,
    required: true,
  },
  version: {
    type: String,
    required: true,
  },
  effectiveDate: {
    type: Date,
    required: true,
  },
  expiryDate: Date,
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Draft'],
    default: 'Draft',
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

policyDocumentSchema.index({ title: 1, effectiveDate: 1, status: 1 });

const PolicyDocument = mongoose.model('PolicyDocument', policyDocumentSchema);

export default PolicyDocument;