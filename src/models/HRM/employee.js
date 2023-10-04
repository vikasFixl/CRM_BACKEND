const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    userName: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    email: { type: String, unique: false },
    phone: { type: String, unique: false },
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    joinDate: Date,
    leaveDate: Date,
    employeeId: { type: String, unique: true },
    bloodGroup: String,
    image: String,
    employmentStatus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EmploymentStatus",
    },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
    roleId: { type: mongoose.Schema.Types.ObjectId, ref: "RolePermission" },
    role: { type: mongoose.Schema.Types.ObjectId, ref: "Role" },
    shiftId: { type: mongoose.Schema.Types.ObjectId, ref: "Shift" },
    leavePolicy: { type: mongoose.Schema.Types.ObjectId, ref: "LeavePolicy" },
    weeklyHoliday: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WeeklyHoliday",
    },
    attendance: [{ type: mongoose.Schema.Types.ObjectId, ref: "Attendances" }],
    leaveApplication: [
      { type: mongoose.Schema.Types.ObjectId, ref: "LeaveApplication" },
    ],
    payslip: [{ type: mongoose.Schema.Types.ObjectId, ref: "Payslip" }],
    educations: { type: Array, required: false },
    salaryHistory: { type: Array, required: false },
    designationHistory: { type: Array, required: false },
    awardHistory: [
      { type: mongoose.Schema.Types.ObjectId, ref: "AwardHistory" },
    ],
    status: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now, updatedAt: true },
    project: [{ type: mongoose.Schema.Types.ObjectId, ref: "Project" }],
    projectTeamMember: [
      { type: mongoose.Schema.Types.ObjectId, ref: "ProjectTeamMember" },
    ],
    assignedTask: [
      { type: mongoose.Schema.Types.ObjectId, ref: "AssignedTask" },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Employees", employeeSchema);
