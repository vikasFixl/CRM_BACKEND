import mongoose from 'mongoose';
const { Schema } = mongoose;

const timeTrackingSchema = new Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmployeeProfile',
    required: true,
  },
  isLate: {
    type: Boolean,
    default: false,
  },
  deviceInfo: String,
  location: {
    lat: Number,
    long: Number,
  },
  date: {
    type: Date,
    required: true,
  },
  clockIn: {
    type: Date,
    required: true,
  },
  clockOut: {
    type: Date,
  },
  duration: {
    type: Number, // Duration in hours
    default: 0,
  },
  status: {
    type: String,
    enum: ['Clock In', 'Clock Out'],
    default: 'Clock In',
    index: true,
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

timeTrackingSchema.index({ date: 1, status: 1 });

timeTrackingSchema.pre('save', function (next) {
  if (this.clockIn && this.clockOut) {
    const ms = this.clockOut - this.clockIn;
    this.duration = Math.round(ms / (1000 * 60 * 60) * 100) / 100; // in hours, rounded
  }
  next();
});

const TimeTracking = mongoose.model('TimeTracking', timeTrackingSchema);

export default TimeTracking;