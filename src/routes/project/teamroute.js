// routes/teamRoutes.js
import express from "express";
import {
  createTeam,
  getTeamsByWorkspace,
  addTeamMember,
  getTeamMembers,
  removeTeamMember,
  toggleArchiveTeam,
  deleteTeam,
} from "../controllers/teamController.js";


const router = express.Router();

// ✅ Team routes
router.route("/")
  .post(protect, createTeam);

router.route("/workspace/:workspaceId")
  .get(protect, getTeamsByWorkspace);

router.route("/:teamId/members")
  .post(protect, addTeamMember)
  .get(protect, getTeamMembers);

router.route("/:teamId/members/:memberId")
  .delete(protect, removeTeamMember);

router.route("/:teamId/archive")
  .patch(protect, toggleArchiveTeam);

router.route("/:teamId")
  .delete(protect, deleteTeam);

export default router;