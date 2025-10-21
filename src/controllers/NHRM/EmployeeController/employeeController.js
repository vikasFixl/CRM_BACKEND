import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Onboarding } from "../../../models/NHRM/employeeManagement/onboarding.js";
import { EmployeeProfile } from "../../../models/NHRM/employeeManagement/employeeProfile.js";
import Org from "../../../models/OrgModel.js"

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

/**
 * Create Employee Account (by HR/Admin)
 */
const generateEmployeeId = () => {
  const short = crypto.randomBytes(3).toString("hex").toUpperCase(); // 6-char hex
  return `EMP_${short}`; // like EMP_1F2A9C
};
export function generateShortPassword() {
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  const symbols = "!@#$%^&*";

  const allChars = lower + upper + numbers + symbols;

  let password = "";

  // Ensure at least one character from each category if possible
  password += lower[Math.floor(Math.random() * lower.length)];
  password += upper[Math.floor(Math.random() * upper.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];

  // Fill remaining 2 characters randomly
  for (let i = password.length; i < 6; i++) {
    const idx = crypto.randomInt(0, allChars.length);
    password += allChars[idx];
  }

  // Shuffle to avoid predictable order
  password = password.split("").sort(() => 0.5 - Math.random()).join("");

  return password;
}
export const createEmployee = async (req, res) => {
  try {
    const orgId = req.orgUser.orgId;
    const    employeeId=generateEmployeeId();
    const created=req.user.userId;
    const {
   
      firstName,
      lastName,
      email,
      department,
      position,
      employmentType,
      createdBy,
    } = req.body;

    const org = await Org.findById(orgId);
    if (!org) return res.status(404).json({ message: "Org not found" });

    const existing = await EmployeeProfile.findOne({
      "personalInfo.contact.email": email,
      orrganizationId: orgId,
    });
    if (existing) return res.status(400).json({ message: "Employee already exists" });


    const employee = await EmployeeProfile.create({
      organizationId: orgId,
      employeeId,
      password:await generateShortPassword(),
      personalInfo: {
        firstName,
        lastName,
        contact: { email},
      },
      jobInfo: {
        department,
        position,
        employmentType,
      },
      createdBy:created
    });

    // Create onboarding record
    await Onboarding.create({
      organizationId: orgId,
      employeeId: employee._id,
      initiatedBy: createdBy,
      status: "Pending",
      steps: [
        { key: "personalInfo", label: "Personal Information" ,status:"Pending"},
        { key: "documents", label: "Upload Documents", status:"Pending"},
        { key: "bankDetails", label: "Bank Details", status:"Pending"},
      ],
      checklistProgress: { total: 3 },
    });

    res.status(201).json({ message: "Employee created successfully", employee });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Employee Login
 */
export const employeeLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const employee = await EmployeeProfile.findOne({ "personalInfo.contact.email": email })
      .populate("jobInfo.department jobInfo.position");

    if (!employee) return res.status(404).json({ message: "Employee not found" });

    if (!employee.userId) {
      // If not linked to a User account, simulate password check (HR onboarding-only)
      const tempPassword = employee.personalInfo.dob?.toISOString().split("T")[0]; // fallback password rule
      if (password !== tempPassword)
        return res.status(401).json({ message: "Invalid credentials (temp login failed)" });
    }

    // Onboarding check
    let onboarding = await Onboarding.findOne({ employeeId: employee._id });
    if (!onboarding) {
      onboarding = await Onboarding.create({
        OrgId: employee.OrgId,
        employeeId: employee._id,
        initiatedBy: employee._id,
        status: "Pending",
        steps: [
          { key: "personalInfo", label: "Personal Information" },
          { key: "documents", label: "Upload Documents" },
          { key: "bankDetails", label: "Bank Details" },
        ],
        checklistProgress: { total: 3 },
      });
    }

    // JWT token
    const token = jwt.sign(
      {
        employeeId: employee._id,
        OrgId: employee.OrgId,
        role: employee.jobInfo.position,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const requiresOnboarding = onboarding.status !== "Completed";

    res.json({
      message: "Login successful",
      token,
      requiresOnboarding,
      onboardingStatus: onboarding.status,
      employee,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Fetch all employees in Org
 */
export const getEmployees = async (req, res) => {
  try {
    const { OrgId } = req.params;
    const employees = await EmployeeProfile.find({ OrgId }).populate(
      "jobInfo.department jobInfo.position"
    );
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Update Employee (for onboarding form updates)
 */
export const updateEmployeeProfile = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const updateData = req.body;

    const employee = await EmployeeProfile.findByIdAndUpdate(employeeId, updateData, { new: true });
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    res.json({ message: "Employee updated", employee });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Soft Delete Employee
 */
export const deleteEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const employee = await EmployeeProfile.findById(employeeId);
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    employee.jobInfo.status = "Terminated";
    await employee.save();

    res.json({ message: "Employee terminated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
