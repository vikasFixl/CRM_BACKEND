import mongoose from 'mongoose';
const { Schema } = mongoose;

const learningMaterialSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  description: {
    type: String,
    required: true,
  },
  materialType: {
    type: String,
    enum: ['Document', 'Video', 'Presentation', 'Other'],
    required: true,
  },
  fileUrl: {
    type: String,
    required: true,
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

learningMaterialSchema.index({ title: 1 });

const LearningMaterial = mongoose.model('LearningMaterial', learningMaterialSchema);

export default LearningMaterial;