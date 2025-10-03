// models/EngagementSurvey.js
import mongoose from "mongoose";
const { Schema, model } = mongoose;

const questionSchema = new Schema(
  {
    text: { type: String, required: true },
    type: { type: String, enum: ["Multiple Choice", "Short Answer", "Rating"], required: true },
    options: [String], // Only for Multiple Choice
  },
  { _id: true } // Each question gets its own _id
);

const engagementSurveySchema = new Schema(
  {
    surveyName: { type: String, required: true, trim: true, index: true },
    surveyDescription: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    questions: [questionSchema],
    status: { type: String, enum: ["Open", "Closed"], default: "Open", index: true },
  },
  { timestamps: true }
);

engagementSurveySchema.index({ startDate: 1, endDate: 1, status: 1 });

const EngagementSurvey = model("EngagementSurvey", engagementSurveySchema);
export default EngagementSurvey;