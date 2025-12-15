const monthlySummarySchema = new Schema({
  employeeId: Schema.Types.ObjectId,
  month: String,
  presentDays: Number,
  absentDays: Number,
  leaveDays: Number,
  holidays: Number,
  overtimeHours: Number,
  payableDays: Number,
  lockedForPayroll: Boolean,
  companyId: Schema.Types.ObjectId
}, { timestamps: true });

export default mongoose.model("MonthlyAttendanceSummary", monthlySummarySchema);
