// models/WellnessProgram.js
import mongoose from "mongoose";
const { Schema, model } = mongoose;

const wellnessProgramSchema = new Schema(
  {
    programName: { type: String, required: true, trim: true, index: true },
    programDescription: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    targetAudience: {
      type: String,
      enum: ["All Employees", "Department", "Role"],
      required: true,
    },
    targetDepartments: [{ type: Schema.Types.ObjectId, ref: "Department" }], // optional if targeting specific departments
    targetRoles: [{ type: Schema.Types.ObjectId, ref: "Position" }], // optional if targeting roles
    status: { type: String, enum: ["Active", "Inactive", "Completed"], default: "Active", index: true },
    enrolledEmployees: [{ type: Schema.Types.ObjectId, ref: "EmployeeProfile" }], // track participation
  },
  { timestamps: true }
);

wellnessProgramSchema.index({ startDate: 1, endDate: 1, status: 1 });

const WellnessProgram = model("WellnessProgram", wellnessProgramSchema);
export default WellnessProgram;
