const holidaySchema = new Schema({
  companyId: { type: Schema.Types.ObjectId, required: true },
  date: { type: Date, required: true },
  name: String,
  type: { type: String, enum: ["National", "Optional", "WeeklyOff"] },
  locationId: Schema.Types.ObjectId,
  isPaid: Boolean
}, { timestamps: true });

export default mongoose.model("HolidayCalendar", holidaySchema);
