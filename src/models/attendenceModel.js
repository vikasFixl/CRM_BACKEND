var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var AttendanceSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  empId: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
  year: { type: Number, required: true },
  month: { type: Number, required: true },
  date: { type: Number, required: true },
  chkIn: { type: String, required: true },
  chkOut: { type: String, required: false },
  present: { type: Boolean, required: true },
});

module.exports = mongoose.model("Attendance", AttendanceSchema);
