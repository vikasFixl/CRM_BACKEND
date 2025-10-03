import mongoose from 'mongoose';
const { Schema } = mongoose;

const timesheetSchema = new Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmployeeProfile',
    required: true,
  },
  periodStart: {
    type: Date,
    required: true,
  },
  periodEnd: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['Draft', 'Submitted', 'Approved', 'Rejected'],
    default: 'Draft',
    index: true,
  },
  hours: [
    {
      date: Date,
      hoursWorked: Number,
      overtimeHours: Number,
      notes: String,
    },
  ],
  totalHours: {
    type: Number,
    default: 0,
  },
  totalOvertimeHours: {
    type: Number,
    default: 0,
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmployeeProfile',
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmployeeProfile',
  },
  submissionDate: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

timesheetSchema.index({ periodStart: 1, periodEnd: 1, status: 1 });

timesheetSchema.pre('save', function (next) {
  this.totalHours = this.hours.reduce((sum, h) => sum + (h.hoursWorked || 0), 0);
  this.totalOvertimeHours = this.hours.reduce((sum, h) => sum + (h.overtimeHours || 0), 0);
  next();
});

const Timesheet = mongoose.model('Timesheet', timesheetSchema);

export default Timesheet;