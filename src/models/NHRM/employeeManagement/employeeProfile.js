import mongoose from 'mongoose';
const { Schema } = mongoose;

const familyMemberSchema = new Schema({
  name: String,
  relationship: String,
  phone: String,
  dob: Date,
}, { _id: false });

const bankDetailSchema = new Schema({
  accountHolder: String,
  bankName: String,
  accountNumber: String,
  ifsc: String,
  branch: String,
}, { _id: false });

const documentSchema = new Schema({
  type: { type: String, enum: ["PAN", "AADHAR", "PASSPORT", "DRIVING_LICENSE", "OTHER"] },
  number: String,
  fileUrl: String,
  public_id: String,
}, { _id: false });
const employeeSchema = new Schema({
  organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
  offer: { type: mongoose.Schema.Types.ObjectId, ref: 'Offer', required: true },
  employeeId: { type: String, required: true }, // company-assigned unique ID
  userId: { type: Schema.Types.ObjectId, ref: "User" }, // optional link to auth User
  personalInfo: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dob: Date,
    gender: { type: String, enum: ["Male", "Female", "Other"], default: "Male" },
    maritalStatus: { type: String, enum: ["Single", "Married", "Divorced", "Widowed"], default: "Single" },
      email: { type: String, required: true },
      phone: String,
      address: String,
      city: String,
      state: String,
      country: String,
      pincode: String,
    
  },
  jobInfo: {
    department: { type: Schema.Types.ObjectId, ref: "Department", required: true },
    position: { type: Schema.Types.ObjectId, ref: "Position", required: true },
    joinDate: Date,
    endDate: Date,
    employmentType: { type: String, enum: ["Permanent", "Contract", "Intern", "Consultant"], default: "Permanent" },
    status: { type: String, enum: ["Active", "Inactive", "OnLeave", "Terminated"], default: "Active" },
  },
  onboardingStatus: {
    type: String,
    enum: [
      "NotStarted",
      "Initiated",  // HR created onboarding entry
      "Pending",       // waiting for employee to submit docs
      "InProgress",    // HR verifying docs
      "Completed",     // done
      "Rejected",      // documents failed / not approved
      "Cancelled"      // onboarding withdrawn or stopped
    ],
    default: "NotStarted",
    index: true,
  },

  offboardingStatus: {
    type: String,
    enum: [
      "NotStarted",
      "Initiated",     // HR created onboarding entry
      "Pending",       // waiting for employee to submit docs
      "InProgress",    // HR verifying docs
      "Completed",     // done
      "Rejected",      // documents failed / not approved
      "Cancelled"      // onboarding withdrawn or stopped
    ],
    default: "NotStarted",
    index: true,
  },
  bankDetails: bankDetailSchema,
  documents: [documentSchema],
  family: [familyMemberSchema],

  profileImage: String,
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

employeeSchema.index({ organizationId: 1, employeeId: 1 }, { unique: true });

export const EmployeeProfile = mongoose.model("EmployeeProfile", employeeSchema);

