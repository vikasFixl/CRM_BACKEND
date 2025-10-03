import mongoose from 'mongoose';
const { Schema } = mongoose;

const feedbackSchema = new Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmployeeProfile',
    required: true,
  },
  feedbackDate: {
    type: Date,
    required: true,
  },
  feedbackType: {
    type: String,
    enum: ['Peer', 'Subordinate', 'Manager', 'Self'],
    required: true,
  },
  feedbackFrom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmployeeProfile',
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  comments: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

feedbackSchema.index({ feedbackDate: 1, feedbackType: 1 });

const Feedback = mongoose.model('Feedback', feedbackSchema);

export default Feedback;