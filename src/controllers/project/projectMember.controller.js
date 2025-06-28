// project member routes
import User from "../../models/userModel.js";
import { OrgMember } from "../../models/OrganisationMemberSchema.js";
import { Member } from "../../models/project/MemberModel.js";
import { addMemberSchema } from "../../validations/project/project.js";
import { ProjectMember } from "../../models/project/projectMemberModel.js";
import { Workspace } from "../../models/project/WorkspaceModel.js";
import { RolePermission } from "../../models/RolePermission.js";
import { Project } from "../../models/project/ProjectModel.js";
import mongoose from "mongoose";

export const assignMember = async (req, res) => {
  try {
    const {projectId} = req.params;
    const orgId = req.orgUser.orgId;

    // ✅ Validate request body
    const parsed = addMemberSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation error",
        errors: parsed.error.errors.map((e) => e.message),
      });
    }

    const { email, level,  workspaceId,  role: roleName } = parsed.data;

    // ✅ Validate IDs
    if (!mongoose.isValidObjectId(workspaceId)) {
      return res.status(400).json({ message: "Invalid workspaceId" });
    }
    if (level === "project" && !mongoose.isValidObjectId(projectId)) {
      return res.status(400).json({ message: "Invalid projectId" });
    }

    // ✅ Check user
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User dosen't exist on this platform" });

    // ✅ Check if user is in organization
    const isOrgMember = await OrgMember.exists({
      userId: user._id,
      organizationId: orgId,
    });
    if (!isOrgMember) {
      return res
        .status(403)
        .json({ message: "User is not a member of this current  organization" });
    }

    // ✅ Validate workspace
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace)
      return res.status(404).json({ message: "Workspace not found" });

    // ✅ Fetch RolePermission
    let workrole = "WorkspaceMember";
    const role = await RolePermission.findOne({ role: workrole });
    if (!role) return res.status(404).json({ message: "Role not found" });

    // ✅ Add to workspace (for both levels)
    const existingWorkspaceMember = await Member.findOne({
      userId: user._id,
      workspaceId,
      organizationId: orgId,
    });

    if (!existingWorkspaceMember) {
      await Member.create({
        userId: user._id,
        workspaceId,
        organizationId: orgId,
        role: role._id,
        invitedBy: req.user.userId,
      });
    }

    // ✅ If only adding to workspace
    if (level === "workspace") {
      if (existingWorkspaceMember) {
        return res.status(400).json({ message: "User already in workspace" });
      }
      return res.status(200).json({ message: "User added to workspace" });
    }

    // ✅ Add to project
    const project = await Project.findOne({
      _id: projectId,
      workspace: workspaceId,
    });
    if (!project) {
      return res
        .status(404)
        .json({ message: "Project not found in workspace" });
    }

    const alreadyInProject = await ProjectMember.exists({
      userId: user._id,
      projectId,
    });

    if (alreadyInProject) {
      return res.status(400).json({ message: "User already in project" });
    }

    const projectrole = await RolePermission.findOne({ role: roleName });
    await ProjectMember.create({
      userId: user._id,
      projectId,
      workspaceId,
      organizationId: orgId,
      role: projectrole._id,
      addedBy: req.user.userId,
    });

    return res.status(200).json({ message: "User added to project" });
  } catch (error) {
    console.error("Error assigning member:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const getAllProjectMembers = async (req, res) => {
  try {
    const projectId = req.params.projectId;

    if (!projectId) {
      return res.status(400).json({ message: "Project ID is required" });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Populate user and role fields
    const membersRaw = await ProjectMember.find({ projectId })
      .populate("userId", "email fullName")
      .populate("role") // includes role name and permissions
      .skip(skip)
      .limit(limit);

    const totalMembers = await ProjectMember.countDocuments({ projectId });

    // Format each member
    const members = membersRaw.map((member) => {
      const roleName = member.role?.role;
      const defaultPermissions = member.role?.permissions ?? [];

      // Use override permissions if custom
      const effectivePermissions = member.hasCustomPermission
        ? member.permissionsOverride.flatMap((perm) => perm.actions)
        : defaultPermissions.flatMap((perm) => perm.actions);

      return {
        _id: member._id,
        userId: member.userId?._id,
        email: member.userId?.email,
        fullName: member.userId?.fullName,
        role: roleName,
        hasCustomPermission: member.hasCustomPermission,
        permissions: effectivePermissions,
      };
    });

    res.status(200).json({
      message: "Project members fetched successfully",
      members,
      pagination: {
        totalMembers,
        totalPages: Math.ceil(totalMembers / limit),
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    console.error("Error fetching project members:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};