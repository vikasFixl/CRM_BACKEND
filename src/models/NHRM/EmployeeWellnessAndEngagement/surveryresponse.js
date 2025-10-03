// Separate collection for responses
// models/SurveyResponse.js
const surveyResponseSchema = new Schema(
  {
    survey: { type: Schema.Types.ObjectId, ref: "EngagementSurvey", required: true, index: true },
    employee: { type: Schema.Types.ObjectId, ref: "EmployeeProfile", required: true },
    answers: [
      {
        questionId: { type: Schema.Types.ObjectId, required: true },
        answer: String,
      },
    ],
  },
  { timestamps: true }
);

surveyResponseSchema.index({ survey: 1, employee: 1 }, { unique: true });

const SurveyResponse = model("SurveyResponse", surveyResponseSchema);
export default SurveyResponse;