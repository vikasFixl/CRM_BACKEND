// Data Visualization Toolsimport mongoose from 'mongoose';
const { Schema } = mongoose;

const dataVisualizationSchema = new Schema({
  visualizationName: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  visualizationType: {
    type: String,
    enum: ['Chart', 'Graph', 'Map', 'Table'],
    required: true,
  },
  dataSources: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DataSource',
      required: true,
    },
  ],
  configuration: {
    type: Object,
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

dataVisualizationSchema.index({ visualizationName: 1, visualizationType: 1 });

const DataVisualization = mongoose.model('DataVisualization', dataVisualizationSchema);

export default DataVisualization;