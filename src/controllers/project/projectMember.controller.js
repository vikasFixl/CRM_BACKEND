// project member routes
import User from "../../models/userModel.js";
import { OrgMember } from "../../models/OrganisationMemberSchema.js";
import { Member } from "../../models/project/MemberModel.js";
import { addMemberSchema } from "../../validations/project/project.js";
import { ProjectMember } from "../../models/project/projectMemberModel.js";
import { Workspace } from "../../models/project/WorkspaceModel.js";
import { RolePermission } from "../../models/RolePermission.js";
import { Project } from "../../models/project/ProjectModel.js";
import { Task } from "../../models/project/TaskModel.js";
import mongoose from "mongoose";
// add member
export const assignMember = async (req, res) => {
  try {
    const { projectId } = req.params;
    const orgId = req.orgUser.orgId;

    // ✅ Validate request body
    const parsed = addMemberSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation error",
        errors: parsed.error.errors.map((e) => e.message),
      });
    }

    const { email, level, workspaceId, role: roleName } = parsed.data;

    // ✅ Validate IDs
    if (!mongoose.isValidObjectId(workspaceId)) {
      return res.status(400).json({ message: "Invalid workspaceId" });
    }
    if (level === "project" && !mongoose.isValidObjectId(projectId)) {
      return res.status(400).json({ message: "Invalid projectId" });
    }

    // ✅ Check user
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({ message: "User dosen't exist on this platform" });

    // ✅ Check if user is in organization
    const isOrgMember = await OrgMember.exists({
      userId: user._id,
      organizationId: orgId,
    });
    if (!isOrgMember) {
      return res.status(403).json({
        message: "User is not a member of this current  organization",
      });
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
    user.currentWorkspace = workspaceId;
    await user.save();
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
    }).select("totalmembers");

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
      .populate("role", "role permissions")
      .skip(skip)
      .limit(limit);
     
console.log(membersRaw)
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
      m_id: member._id,
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

export const UpdateProjectMember = async (req, res) => {
  try {
    const { projectId, memberId } = req.params;
    const { role: newRoleName, overridePermissions } = req.body;

    // Find the member
    const member = await ProjectMember.findOne({
      _id: memberId,
      projectId,
    }).populate("role", "role");

    if (!member) {
      return res.status(404).json({ error: "Project member not found" });
    }

    const currentRole = member.role?.role;
    const isRoleChanged = currentRole !== newRoleName;

    const updates = {};

    // ✅ 1. Handle Role Change
    if (isRoleChanged) {
      const newRole = await RolePermission.findOne({ role: newRoleName });
      if (!newRole) {
        return res.status(404).json({ error: "Role not found" });
      }
      updates.role = newRole._id;
      updates.hasCustomPermission = false;
      updates.permissionsOverride = [];
    }

    // ✅ 2. If role not changed, apply custom permissions if provided
    if (
      !isRoleChanged &&
      Array.isArray(overridePermissions) &&
      overridePermissions.length > 0
    ) {
      updates.hasCustomPermission = true;
      updates.permissionsOverride = overridePermissions;
    }

    // ✅ 3. Apply and Save
    Object.assign(member, updates);
    await member.save();

    res.status(200).json({
      message: `Project member role updated successfully${isRoleChanged ? " and permissions" : ""
        }`,
      member,
    });
  } catch (error) {
    console.error("updateProjectMember error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
export const RemoveProjectMember = async (req, res) => {
  try {
    const memberId = req.params.memberId;

    // ✅ 1. find the proejct member
    const project = await ProjectMember.findById(memberId).populate(
      "role",
      "role"
    );
    if (!project) {
      return res.status(404).json({ message: "Project member not found" });
    }
    if (project.role.role === "ProjectOwner") {
      return res
        .status(400)
        .json({ message: "Owner cannot remove himself from the project" });
    }
    const removedMember = await ProjectMember.findByIdAndDelete(memberId);

    if (!removedMember) {
      return res.status(404).json({ message: "Project member not found" });
    }

    // ✅ 2. Unassign tasks where this member was the assignee
    await Task.updateMany(
      { assigneeId: memberId },
      { $unset: { assigneeId: "" } }
    );

    return res.status(200).json({
      message: "Project member removed and tasks unassigned",
      removedMemberId: memberId,
    });
  } catch (error) {
    console.error("Error removing project member:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
