import mongoose from 'mongoose';
const { Schema } = mongoose;

const feedbackSchema = new Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true
    },

    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EmployeeProfile',
      required: true,
      index: true
    },

    feedbackDate: {
      type: Date,
      required: true,
      default: Date.now()
    },

    feedbackType: {
      type: String,
      enum: ['Peer', 'Subordinate', 'Manager', 'Self'],
      required: true,
    },

    feedbackFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EmployeeProfile',
      default: null,
    },

    rating: {
      type: Number,
      min: 1,
      max: 5,
    },

    comments: {
      type: String,
      trim: true,
      maxLength: 1000,
    }
  },
  { timestamps: true } // Automatically manages createdAt and updatedAt
);

// Indexes to optimize performance
feedbackSchema.index({ organization: 1, employee: 1 });
feedbackSchema.index({ feedbackDate: 1, feedbackType: 1 });

const Feedback = mongoose.model('Feedback', feedbackSchema);

export default Feedback;
