import mongoose from "mongoose";
const { Schema } = mongoose;

/* ---------- SUBSCHEMAS ---------- */

const familySchema = new Schema({
  name: String,
  relationship: String,
  phone: String,
  dob: Date
}, { _id: false });

const bankSchema = new Schema({
  accountHolder: String,
  bankName: String,
  accountNumber: { type: String, match: /^\d{9,18}$/ },
  ifsc: { type: String, match: /^[A-Z]{4}0[A-Z0-9]{6}$/ }
}, { _id: false });

const documentSchema = new Schema({
  type: { type: String, enum: ["PAN", "AADHAR", "PASSPORT", "DL", "OTHER"] },
  number: String,
  fileUrl: String
}, { _id: false });

/* ---------- MAIN ---------- */

const employeeSchema = new Schema({
  organizationId: {
    type: Schema.Types.ObjectId,
    ref: "Organization",
    required: true,
    index: true
  },

  employeeId: {
    type: String,
    required: true,
    immutable: true,
    match: /^[A-Z]{2,5}-\d{4,6}$/
  },

  userId: { type: Schema.Types.ObjectId, ref: "User" },
  offerId: { type: Schema.Types.ObjectId, ref: "Offer", required: true },

  personalInfo: {
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    dob: Date,
    address: {
      line1: String,
      city: String,
      state: String,
      country: String,
      pincode: String
    }
  },

  jobInfo: {
    departmentId: { type: Schema.Types.ObjectId, ref: "Department" },
    positionId: { type: Schema.Types.ObjectId, ref: "Position" },
    joinDate: Date,
    employmentType: {
      type: String,
      enum: ["Permanent", "Contract", "Intern", "Consultant"]
    }
  },

  employmentStatus: {
    type: String,
    enum: ["Active", "Suspended", "Terminated"],
    default: "Active",
    index: true
  },

  onboardingStatus: {
    type: String,
    enum: ["NotStarted", "InProgress", "Completed", "Rejected"],
    default: "NotStarted",
    index: true
  },

  offboardingStatus: {
    type: String,
    enum: ["NotStarted", "InProgress", "Completed"],
    default: "NotStarted"
  },

  attendanceEnabled: { type: Boolean, default: false },
  attendanceStartDate: Date,

  bankDetails: bankSchema,
  documents: [documentSchema],
  family: [familySchema],

  activatedAt: Date,
  terminatedAt: Date,

  createdBy: { type: Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

employeeSchema.index(
  { organizationId: 1, employeeId: 1 },
  { unique: true }
);

employeeSchema.pre("save", function (next) {
  if (
    this.attendanceStartDate &&
    this.jobInfo?.joinDate &&
    this.attendanceStartDate < this.jobInfo.joinDate
  ) {
    return next(new Error("attendanceStartDate < joinDate"));
  }
  next();
});

export const EmployeeProfile = mongoose.model("EmployeeProfile", employeeSchema);
