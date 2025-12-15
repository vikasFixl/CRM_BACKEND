const dailyAttendanceSchema = new Schema({
  employeeId: { type: Schema.Types.ObjectId, ref: "EmployeeProfile", required: true },
  date: { type: Date, required: true },
  shiftId: { type: Schema.Types.ObjectId, ref: "ShiftMaster" },
  firstIn: Date,
  lastOut: Date,
  totalWorkMinutes: Number,
  lateMinutes: Number,
  earlyMinutes: Number,
  overtimeMinutes: Number,
  status: { type: String, enum: ["Present", "Absent", "HalfDay", "Leave", "Holiday"] },
  source: { type: String, enum: ["system", "regularized"], default: "system" },
  isLocked: { type: Boolean, default: false },
  companyId: { type: Schema.Types.ObjectId, required: true }
}, { timestamps: true });

dailyAttendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

export default mongoose.model("DailyAttendance", dailyAttendanceSchema);
