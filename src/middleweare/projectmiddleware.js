import { Member } from "../models/project/MemberModel.js";
import { ProjectMember } from "../models/project/projectMemberModel.js";

export const checkProjectPermission = (action) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.userId; // assuming user is attached by auth middleware
      const projectId = req.params.projectId;
      const workspaceId = req.body.workspaceId;

      if (!userId || !projectId) {
        return res.status(400).json({ message: "Missing user or project ID" });
      }

      const workspaceMember = await Member.findOne({
        userId,
        workspaceId,
        organizationId: req.orgUser.orgId,
        isRemoved: false,
      }).populate("role", " permissions");

      if (!workspaceMember) {
        return res
          .status(403)
          .json({ message: "You are not a member of this workspace" });
      }
      let workspacePermissions =
        workspaceMember.role?.permissions?.flatMap((p) => p.actions) || [];
      if (workspacePermissions.includes(action)) {
        return next();
      }

      // check if worksapce owner hits endpoint

      // check if is worspace Admin
      // ✅ Check prkoject membership
      const projectMember = await ProjectMember.findOne({
        userId,
        projectId,
        isRemoved: false,
      }).populate("role");

      if (!projectMember) {
        return res
          .status(403)
          .json({ message: "You are not a member of this project" });
      }
      //   logger.info("projectMember", projectMember.role?.permissions);
      // ✅ Get effective permissions
      let allowedActions = [];

      if (
        projectMember.hasCustomPermission &&
        projectMember.permissionsOverride.length
      ) {
        allowedActions = projectMember.permissionsOverride.flatMap(
          (p) => p.actions
        );
      } else {
        allowedActions =
          projectMember.role?.permissions?.flatMap((p) => p.actions) || [];
      }

      // ✅ Check if the action is allowed
      if (!allowedActions.includes(action)) {
        return res
          .status(403)
          .json({ message: "You are not allowed to perform this action" });
      }

      // Attach role/permissions to req if needed downstream
      req.projectMember = projectMember;
      req.userPermissions = allowedActions;

      next();
    } catch (error) {
      logger.error("Permission check error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
};
