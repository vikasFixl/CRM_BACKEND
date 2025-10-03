// models/RecognitionReward.js
import mongoose from "mongoose";
const { Schema, model } = mongoose;

const recognitionRewardSchema = new Schema(
  {
    employee: { type: Schema.Types.ObjectId, ref: "EmployeeProfile", required: true },
    recognitionDate: { type: Date, required: true },
    recognitionType: { type: String, enum: ["Award", "Promotion", "Bonus", "Other"], required: true },
    description: { type: String, required: true },
    awardedBy: { type: Schema.Types.ObjectId, ref: "User", required: true }, // HR/Admin who awarded
    attachments: [{ name: String, url: String }], // Optional certificates/images
  },
  { timestamps: true }
);

recognitionRewardSchema.index({ recognitionDate: 1 });

const RecognitionReward = model("RecognitionReward", recognitionRewardSchema);
export default RecognitionReward;
