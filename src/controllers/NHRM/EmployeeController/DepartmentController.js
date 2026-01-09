import { Department } from "../../../models/NHRM/employeeManagement/department.js";
import { OrgMember } from "../../../models/OrganisationMemberSchema.js";
import Org from "../../../models/OrgModel.js";
import { departmentSchema } from "../../../validations/hrm/department.js";
import { Position } from "../../../models/NHRM/employeeManagement/postition.js";
import { EmployeeProfile } from "../../../models/NHRM/employeeManagement/employeeProfile.js";
import { JobPosting } from "../../../models/NHRM/Recruitement/jobPostings.js";
import { z } from "zod";
export const createDepartment = async (req, res) => {
  try {
    const orgId = req.orgUser.orgId;
    const createdBy = req.orgUser.userId;
    const validated = departmentSchema.parse(req.body);

    const existing = await Department.findOne({
      organizationId: orgId,
      name: validated.name,
    });

    if (existing)
      return res.status(409).json({
        success: false,
        message: "Department with this name already exists in the organization.",
      });

    const isvalidUser = await OrgMember.findOne({ userId: validated.head || createdBy, organizationId: orgId, status: "active" })
    if (!isvalidUser) {
      return res.status(400).json({ success: false, message: "Department head must be an active member of the organization." });
    }
    const department = await Department.create({
      ...validated,
      organizationId: orgId,
      head: validated.head || createdBy
    });

    res.status(201).json({
      success: true,
      message: "Department created successfully.",
      data: department,
    });
  } catch (err) {
    if (err instanceof z.ZodError)
      return res.status(400).json({ success: false, errors: err.errors });

    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * @desc Get all Departments for an organization
 * @route GET /api/organization/:organizationId/departments
 */
export const getDepartments = async (req, res) => {
  try {
    const { orgId: organizationId } = req.orgUser;

    if (!organizationId)
      return res
        .status(400)
        .json({ success: false, message: "Organization ID is required." });

    const departments = await Department.find({ organizationId })
      .populate("head", "firstName lastName email")
      .sort({ createdAt: -1 })
      .lean(); // important: returns plain JS objects (not Mongoose docs)

    // Transform departments
    const formattedDepartments = departments.map((dept) => ({
      ...dept,
      headEmail: dept.head?.email || null, // in case head is missing
      headName: dept.head
        ? `${dept.head.firstName} ${dept.head.lastName}`
        : null,
    }));

    // Remove the original head object
    formattedDepartments.forEach((d) => delete d.head);

    res.json({
      message: "Departments fetched successfully.",
      success: true,
      count: formattedDepartments.length,
      departments: formattedDepartments,
    });
  } catch (err) {
    logger.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

export const GetDepartmentList = async (req, res) => {
  try {
    const { orgId: organizationId } = req.orgUser;
    const departments = await Department.find({ organizationId })
      .select("name _id")
      .sort({ name: 1 })
      .lean();
    res.json({
      success: true,
      message: "Department list fetched successfully.",
      departments,
    });
  }
  catch (err) {
    logger.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
}


export const getDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: "Department ID is required." });
    const { orgId: organizationId } = req.orgUser;

    const department = await Department.find({ _id: id, organizationId })
      .populate("head", "firstName lastName email")
      .populate("organizationId", "name");

    if (!department)
      return res.status(404).json({ success: false, message: "Department not found." });

    res.json({ message: "Department fetched successfully.", success: true, department });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};


export const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: "Department ID is required." });
    const validated = departmentSchema.partial().parse(req.body);

    const updated = await Department.findByIdAndUpdate(id, validated, { new: true });

    if (!updated)
      return res.status(404).json({ success: false, message: "Department not found." });

    res.json({
      success: true,
      message: "Department updated successfully.",
      data: updated,
    });
  } catch (err) {
    if (err instanceof z.ZodError)
      return res.status(400).json({ success: false, errors: err.errors });

    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * @desc Delete Department (with dependency check)
 * @route DELETE /api/organization/departments/:id
 */
export const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) return res.status(400).json({ success: false, message: "Department ID is required." });
    const { orgId: organizationId } = req.orgUser;
    // find postion linked to department
    const postion = await Position.findOne({ department: id, organizationId })
    if (postion) {
      return res.status(400).json({ success: false, message: "Cannot delete department. Active positions linked." });
    }
    const department = await Department.find({ _id: id, organizationId });
    if (!department)
      return res.status(404).json({ success: false, message: "Department not found." });

    // 🧩 Check for active employees
    const employeeCount = await EmployeeProfile.countDocuments({ "jobInfo.department": id });
    if (employeeCount > 0)
      return res.status(400).json({
        success: false,
        message: `Cannot delete department. ${employeeCount} active employees assigned.`,
      });

    // 🧩 Check for active job postings
    const jobCount = await JobPosting.countDocuments({ department: id, status: "Open" });
    if (jobCount > 0)
      return res.status(400).json({
        success: false,
        message: `Cannot delete department. ${jobCount} active job postings exist.`,
      });

    await Department.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Department deleted successfully.",
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};