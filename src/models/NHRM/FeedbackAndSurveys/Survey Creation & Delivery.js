// Survey Creation & Deliveryimport mongoose from 'mongoose';
const { Schema } = mongoose;

const surveySchema = new Schema({
  title:        { type: String, required: true, trim: true, index: true },
  description:  String,
  questions: [
    {
      text: String,
      type: { type: String, enum: ['Likert', 'Text', 'YesNo'], required: true },
      options: [String] // for Likert
    }
  ],
  audience:     { type: String, enum: ['All', 'Department', 'Role'], default: 'All' },
  department:   { type: mongoose.Schema.Types.ObjectId, ref: 'Department', sparse: true },
  startDate:    { type: Date, required: true },
  endDate:      { type: Date, required: true },
  status:       { type: String, enum: ['Draft', 'Sent', 'Closed'], default: 'Draft', index: true },
  responseCount:{ type: Number, default: 0 },
  createdAt:    { type: Date, default: Date.now },
  updatedAt:    { type: Date, default: Date.now }
});

surveySchema.index({ startDate: 1, status: 1 });

export default mongoose.model('SurveyDelivery', surveySchema);