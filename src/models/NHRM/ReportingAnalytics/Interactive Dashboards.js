// Interactive Dashboardsimport mongoose from 'mongoose';
const { Schema } = mongoose;

const interactiveDashboardSchema = new Schema({
  dashboardName: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  dashboardDescription: {
    type: String,
    required: true,
  },
  widgets: [
    {
      type: String,
      required: true,
    },
  ],
  layout: {
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

interactiveDashboardSchema.index({ dashboardName: 1 });

const InteractiveDashboard = mongoose.model('InteractiveDashboard', interactiveDashboardSchema);

export default InteractiveDashboard;