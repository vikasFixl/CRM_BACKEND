import mongoose from "mongoose";
const { Schema } = mongoose;

const departmentSchema = new Schema({
  organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
  name: { type: String, required: true },
  description: String,
  head: { type: Schema.Types.ObjectId, ref: "EmployeeProfile" },
}, { timestamps: true });

departmentSchema.index({ organizationId: 1, name: 1 }, { unique: true });

export const Department = mongoose.model("Department", departmentSchema);
