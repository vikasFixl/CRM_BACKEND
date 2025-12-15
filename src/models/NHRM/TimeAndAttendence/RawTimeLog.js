const rawTimeLogSchema = new Schema({
  employeeId: { type: Schema.Types.ObjectId, ref: "EmployeeProfile", required: true },
  timestamp: { type: Date, required: true },
  punchType: { type: String, enum: ["IN", "OUT"], required: true },
  source: { type: String, enum: ["mobile", "web", "biometric"], required: true },
  deviceId: String,
  ipAddress: String,
  isManual: { type: Boolean, default: false },
  companyId: { type: Schema.Types.ObjectId, required: true }
}, { timestamps: false });

rawTimeLogSchema.index({ employeeId: 1, timestamp: 1 });

export default mongoose.model("RawTimeLog", rawTimeLogSchema);
