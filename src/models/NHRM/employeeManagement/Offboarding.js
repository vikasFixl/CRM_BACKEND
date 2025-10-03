import mongoose from "mongoose";
const { Schema } = mongoose;

const checklistSchema = new Schema({
  task: String,
  completed: { type: Boolean, default: false },
  completedAt: Date,
}, { _id: false });

const offboardingSchema = new Schema({
  organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
  employeeId: { type: Schema.Types.ObjectId, ref: "EmployeeProfile", required: true },

  reason: String,
  status: { type: String, enum: ["Initiated", "InProgress", "Completed"], default: "Initiated" },
  lastWorkingDay: Date,

  checklist: [checklistSchema],
  feedback: String,

  assignedTo: { type: Schema.Types.ObjectId, ref: "User" }, // HR responsible
}, { timestamps: true });

offboardingSchema.index({ organizationId: 1, employeeId: 1 });

export const Offboarding = mongoose.model("Offboarding", offboardingSchema);
