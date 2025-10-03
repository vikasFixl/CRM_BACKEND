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
}, { _id: false });

const employeeSchema = new Schema({
  organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },

  employeeId: { type: String, required: true }, // company-assigned unique ID
  userId: { type: Schema.Types.ObjectId, ref: "User" }, // optional link to auth User

  personalInfo: {
    firstName: String,
    lastName: String,
    dob: Date,
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    maritalStatus: { type: String, enum: ["Single", "Married", "Divorced", "Widowed"] },
    contact: {
      email: { type: String, required: true },
      phone: String,
      address: String,
    },
  },

  jobInfo: {
    department: { type: Schema.Types.ObjectId, ref: "Department", required: true },
    position: { type: Schema.Types.ObjectId, ref: "Position", required: true },
    joinDate: Date,
    endDate: Date,
    employmentType: { type: String, enum: ["Permanent", "Contract", "Intern", "Consultant"] },
    status: { type: String, enum: ["Active", "Inactive", "OnLeave", "Terminated"], default: "Active" },
  },

  bankDetails: bankDetailSchema,
  documents: [documentSchema],
  family: [familyMemberSchema],

  profileImage: String,
}, { timestamps: true });

employeeSchema.index({ organizationId: 1, employeeId: 1 }, { unique: true });

export const EmployeeProfile = mongoose.model("EmployeeProfile", employeeSchema);

/**
 * Step-by-Step Onboarding-Aware Login Flow

Step 1 — User submits login credentials

User enters email/password.

Backend verifies credentials (bcrypt + JWT/session).

Step 2 — Fetch EmployeeProfile

Use User.employeeId to fetch the linked EmployeeProfile.

This contains personal details, job info, contact info, etc.

Step 3 — Check Onboarding status

Query the Onboarding collection with employeeId.

If no record → create an onboarding record with status Pending.

Inspect onboarding.status:

"Completed" → proceed to Step 4

"Pending" or "In Progress" → go to Step 5

Step 4 — Onboarding completed

Return standard login response:

JWT / session token

EmployeeProfile data

Permissions / roles

Optional metadata (age, department, etc.)

Frontend can redirect to the dashboard.

Step 5 — Onboarding incomplete

Return response indicating onboarding required:

requiresOnboarding: true

status → "Pending" or "In Progress"

steps → array of onboarding steps (with completion/verification info)

documents → uploaded documents with verification status

Optional prefill fields from EmployeeProfile (so employee doesn’t have to retype)

Frontend shows onboarding UI with prefilled info and step checklist.

Step 6 — Employee fills onboarding form

Employee submits updates → directly update EmployeeProfile.

Update the corresponding step in Onboarding.steps → mark completed or verified.

Update checklistProgress in Onboarding → calculate completion percentage.

Step 7 — HR verification (optional)

Some steps may require HR verification (e.g., documents, bank details).

HR approves → step marked Verified in Onboarding.

Step 8 — Complete Onboarding

Once all steps are marked completed → update Onboarding.status = "Completed".

On next login, system automatically treats employee as fully onboarded.

Step 9 — HR dashboard visibility

HR can query Onboarding collection filtered by status (Pending, In Progress)

Join EmployeeProfile to display filled fields, documents, and onboarding progress.
 */