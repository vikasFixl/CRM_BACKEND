// routes/teamRoutes.js
import express from "express";
import {
  addTeamMember,
  createTeam,
  deleteTeam,
  getAssignableMembersForTeam,
  getMyTeamsByWorkspace,
  getTeamById,
  getTeamMembers,
  getTeamsByWorkspace,
  removeTeamMember
}
  from "../../controllers/project/Teamcontroller.js";
import { isAuthenticated } from "../../middleweare/middleware.js" // adjust path as needed
import { authenticateOrgToken } from "../../middleweare/orgmiddleware.js"
import { Team } from "../../models/project/TeamModel.js";

const TeamRouter = express.Router();
// create team 
TeamRouter.route("/")
  .post(isAuthenticated, authenticateOrgToken(), createTeam);
// get all team in workspace
TeamRouter.route("/")
  .get(getTeamsByWorkspace); // admin route to view all teams
  TeamRouter.route("/:teamId/details")
  .get(isAuthenticated,authenticateOrgToken(),getTeamById);
TeamRouter.route("/:workspaceId/all")
  .get(isAuthenticated,authenticateOrgToken(),getMyTeamsByWorkspace);
TeamRouter.route("/:projectId/:teamId/assignable/members")
  .get(isAuthenticated,authenticateOrgToken(),getAssignableMembersForTeam);


TeamRouter.route("/:teamId/add-member")
  .post(isAuthenticated,authenticateOrgToken(),addTeamMember)
 
  TeamRouter.route("/:teamId/members")
  .get(isAuthenticated,authenticateOrgToken(),getTeamMembers);

TeamRouter.route("/:teamId/member/:memberId")
  .delete(isAuthenticated,authenticateOrgToken(),removeTeamMember);

// TeamRouter.route("/:teamId/archive")
//   .patch(toggleArchiveTeam);

TeamRouter.route("/:teamId/delete")
  .delete(isAuthenticated,authenticateOrgToken(),deleteTeam);

export default TeamRouter;