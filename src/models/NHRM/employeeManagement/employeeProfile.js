import mongoose from "mongoose";
const { Schema } = mongoose;

/* ---------- SUBSCHEMAS ---------- */

const bankSchema = new Schema({
  accountHolder: String,
  bankName: String,
  accountNumber: String,
  ifsc: String
}, { _id: false });

const documentSchema = new Schema({
  name: String,        // PAN / Aadhar / Offer Letter / Resume
  number: String,
  fileUrl: String,
  verified: { type: Boolean, default: false }
}, { _id: false });

/* ---------- MAIN SCHEMA ---------- */

const employeeSchema = new Schema({
  /* Organization */
  organizationId: {
    type: Schema.Types.ObjectId,
    ref: "Organization",
    required: true,
    index: true
  },

  employeeCode: {
    type: String,
    required: true,
    immutable: true,
    index: true
  },

  userId: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },

  /* Personal */
  firstName: { type: String, required: true },
  lastName: String,
  email: { type: String, index: true },
  phone: String,
  gender: String,
  dob: Date,

  /* Job */
  departmentId: { type: Schema.Types.ObjectId, ref: "Department" },
  positionId: { type: Schema.Types.ObjectId, ref: "Position" },
  reportingManagerId: { type: Schema.Types.ObjectId, ref: "EmployeeProfile" },

  joinDate: { type: Date, required: true },
  employmentType: {
    type: String,
    enum: ["Permanent", "Contract", "Intern"]
  },

  workLocation: {
    type: String,
    enum: ["Onsite", "Remote", "Hybrid"],
    default: "Onsite"
  },

  /* Access & Status */
  role: {
    type: String,
    enum: ["Employee", "Manager", "Admin"],
    default: "Employee"
  },

  status: {
    type: String,
    enum: ["Active", "Suspended", "Exited"],
    default: "Active",
    index: true
  },

  isActive: { type: Boolean, default: true },

  /* Payroll */
  bankDetails: bankSchema,

  salary: {
    ctc: Number,
    currency: { type: String, default: "INR" }
  },

  /* Compliance */
  documents: [documentSchema],
  kycStatus: {
    type: String,
    enum: ["Pending", "Verified"],
    default: "Pending"
  },

  /* Audit */
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  deletedAt: Date

}, { timestamps: true });

/* ---------- INDEXES ---------- */

/* ---------- INDEXES ---------- */

// Unique employee per organization
employeeSchema.index(
  { organizationId: 1, employeeCode: 1 },
  { unique: true }
);

// Core HR dashboard queries
employeeSchema.index({
  organizationId: 1,
  status: 1,
  isActive: 1
});

// Department-wise listing
employeeSchema.index({
  organizationId: 1,
  departmentId: 1
});

// Manager → Team lookup
employeeSchema.index({
  reportingManagerId: 1,
  isActive: 1
});

// Quick employee search
employeeSchema.index({ email: 1 });
employeeSchema.index({ phone: 1 });

// Payroll runs
employeeSchema.index({
  organizationId: 1,
  isActive: 1
});

// Role-based access
employeeSchema.index({
  organizationId: 1,
  role: 1
});

// Soft delete filtering
employeeSchema.index({ deletedAt: 1 });

// Text search (optional – for name search)
employeeSchema.index({
  firstName: "text",
  lastName: "text",
  employeeCode: "text"
});




export const EmployeeProfile = mongoose.model("EmployeeProfile", employeeSchema);
