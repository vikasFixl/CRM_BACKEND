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
export const hrmLogin = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ message: "Invalid credentials" });

  const memberships = await OrgMember.find({
    userId: user._id,
    isActive: true
  }).populate("organizationId");

  if (memberships.length === 0) {
    return res.status(403).json({
      message: "User not assigned to any organization"
    });
  }

  if (memberships.length === 1) {
    const m = memberships[0];
    const token = generateHRMToken(user._id, m.organizationId._id, m.role);

    return res.json({
      success: true,
      token,
      autoSelected: true
    });
  }

  return res.json({
    success: true,
    autoSelected: false,
    organizations: memberships.map(m => ({
      organizationId: m.organizationId._id,
      name: m.organizationId.name,
      role: m.role
    }))
  });
};
export const selectOrganization = async (req, res) => {
  const { userId } = req.user;
  const { organizationId } = req.body;

  const membership = await OrgMember.findOne({
    userId,
    organizationId,
    isActive: true
  });

  if (!membership) {
    return res.status(403).json({ message: "Access denied" });
  }

  const token = generateHRMToken(
    userId,
    organizationId,
    membership.role
  );

  res.json({ success: true, token });
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
    const employeeId = generateEmployeeId();
    const created = req.user.userId;
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
      personalInfo: {
        firstName,
        lastName,
        email,
      },
      jobInfo: {
        department,
        position,
        employmentType,
      },
      createdBy: created
    });

    // Create onboarding record
    await Onboarding.create({
      organizationId: orgId,
      employeeId: employee._id,
      initiatedBy: createdBy,
      status: "Pending",
      steps: [
        { key: "personalInfo", label: "Personal Information", status: "Pending" },
        { key: "documents", label: "Upload Documents", status: "Pending" },
        { key: "bankDetails", label: "Bank Details", status: "Pending" },
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

    const employee = await EmployeeProfile.findOne({ "personalInfo.email": email })
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
    const orgId = req.orgUser.orgId;

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filters
    const {
      email,
      status,           // jobInfo.status
      employmentType,   // jobInfo.employmentType
      department,       // jobInfo.department
      position,         // jobInfo.position
      onboarding,       // joinDate exists & endDate is null
      offboarding       // endDate exists (completed/terminated)
    } = req.query;

    const filter = { organizationId: orgId };

    if (email) filter.email = { $regex: email, $options: "i" };

    if (status) filter["jobInfo.status"] = status;

    if (employmentType) filter["jobInfo.employmentType"] = employmentType;

    if (department) filter["jobInfo.department"] = department;

    if (position) filter["jobInfo.position"] = position;

    // Filtering onboarding
    if (onboarding === "true") {
      filter["onboardingStatus"] = { $in: ["InProgress", "Completed"] };
    }

    // Filtering not onboarded (optional)
    if (onboarding === "false") {
      filter["onboardingStatus"] = "NotStarted";
    }

    // Filtering offboarding
    if (offboarding === "true") {
      filter["offboardingStatus"] = { $in: ["InProgress", "Completed"] };
    }

    // Filtering not offboarded (optional)
    if (offboarding === "false") {
      filter["offboardingStatus"] = "NotStarted";
    }

    const employees = await EmployeeProfile.find(filter)
      .populate("jobInfo.department jobInfo.position")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await EmployeeProfile.countDocuments(filter);
    logger.info(employees);
    const formattedEmployees = employees.map((emp) => ({
      _id: emp._id,
      employeeId: emp.employeeId,
      email: emp.personalInfo?.email,
      status: emp.jobInfo?.status || null,
      employmentType: emp.jobInfo?.employmentType || null,
      onboarding: Boolean(emp.onboardingStatus && emp.onboardingStatus !== "NotStarted"),
      offboarding: Boolean(emp.offboardingStatus && emp.offboardingStatus !== "NotStarted"),
      department: emp.jobInfo?.department?.name || null,
      position: emp.jobInfo?.position?.title || null,
    }));

    res.json({
      message: "employee fetched successfully",
      success: true,
      employees: formattedEmployees,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });

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

export const getEmployeeById = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const orgId = req.orgUser.orgId;

    const employee = await EmployeeProfile.findOne({ _id: employeeId, organizationId: orgId })
      .populate("jobInfo.department", "name")            // Only return department name
      .populate("jobInfo.position", "title level")
      .populate("offer", "_id offerDetails")
      .select(" -password") // Only return relevant fields
      .lean();

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    logger.info(employee);
    // ✅ Transform response structure (complete + frontend friendly)
    const formatted = {
      id: employee._id,
      employeeId: employee.employeeId,
      organizationId: employee.organizationId,
      // ✅ Offer Details (NEW)
      offer: employee.offer,
      // Personal Info
      personal: {
        firstName: employee.personalInfo?.firstName || "",
        lastName: employee.personalInfo?.lastName || "",
        fullName: `${employee.personalInfo?.firstName || ""} ${employee.personalInfo?.lastName || ""}`.trim(),
        gender: employee.personalInfo?.gender || null,
        maritalStatus: employee.personalInfo?.maritalStatus || null,
        email: employee.personalInfo?.email || null,
        phone: employee.personalInfo?.phone || null,
      },

      // Job Info
      job: {
        status: employee.jobInfo?.status || "Unknown",
        department: {
          id: employee.jobInfo?.department?._id || null,
          name: employee.jobInfo?.department?.name || null,
        },
        position: {
          id: employee.jobInfo?.position?._id || null,
          title: employee.jobInfo?.position?.title || null,
          level: employee.jobInfo?.position?.level || null,
        },
        employmentType: employee.jobInfo?.employmentType || null,
        joinDate: employee.jobInfo?.joinDate || null,
        endDate: employee.jobInfo?.endDate || null,
      },

      // Onboarding / Offboarding
      onboarding: {
        status: employee.onboardingStatus,
        completed: employee.onboardingStatus === "Completed",
      },
      offboarding: {
        status: employee.offboardingStatus,
        completed: employee.offboardingStatus === "Completed",
      },

      // Documents / Family / Other Nested Data
      documents: employee.documents || [],
      family: employee.family || [],

      // Metadata
      createdBy: employee.createdBy || null,
      createdAt: employee.createdAt,
      updatedAt: employee.updatedAt,
    };

    return res.status(200).json({ message: "Employee fetched successfully", employee: formatted });
  } catch (err) {
    logger.info("❌ Error fetching employee:", err);
    res.status(500).json({ error: err.message });
  }
};

export const deleteEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const orgId = req.orgUser.orgId;

    const employee = await EmployeeProfile.findOne({
      _id: employeeId,
      organizationId: orgId,
    });
    if (!employee)
      return res.status(404).json({ message: "Employee not found" });

    // ✅ Check onboarding + offboarding completion
    const isOnboardingDone = employee.onboardingStatus === "Completed";
    const isOffboardingDone = employee.offboardingStatus === "Completed";

    if (!isOnboardingDone || !isOffboardingDone) {
      return res.status(400).json({
        message:
          "Employee cannot be deleted until both onboarding and offboarding are completed.",
        onboardingStatus: employee.onboardingStatus,
        offboardingStatus: employee.offboardingStatus,
      });
    }

    // ✅ Delete employee record
    await EmployeeProfile.findByIdAndDelete(employeeId);

    res.json({ message: "Employee account permanently deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


