import mongoose from "mongoose";
const { Schema } = mongoose;

const positionSchema = new Schema({
  organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
  department: { type: Schema.Types.ObjectId, ref: "Department", required: true },
  title: { type: String, required: true },
  level: { type: String, enum: ["Junior", "Mid", "Senior", "Lead", "Executive"] },
  description: String,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

positionSchema.index({ organizationId: 1, department: 1, title: 1 }, { unique: true });

export const Position = mongoose.model("Position", positionSchema);
