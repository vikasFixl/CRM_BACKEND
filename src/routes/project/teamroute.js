// routes/teamRoutes.js
import express from "express";
import {
  addTeamMember,
  createTeam,
  deleteTeam,
  getTeamMembers,
  getTeamsByWorkspace,
  removeTeamMember
}
  from "../../controllers/project/Teamcontroller.js";
import { isAuthenticated } from "../../middleweare/middleware.js" // adjust path as needed
import { authenticateOrgToken } from "../../middleweare/orgmiddleware.js"

const TeamRouter = express.Router();
// create team 
TeamRouter.route("/")
  .post(isAuthenticated, authenticateOrgToken(), createTeam);
// get all team in workspace
TeamRouter.route("/")
  .get(getTeamsByWorkspace);

TeamRouter.route("/:teamId/members")
  .post(isAuthenticated,authenticateOrgToken(),addTeamMember)
  .get(isAuthenticated,authenticateOrgToken(),getTeamMembers);

TeamRouter.route("/:teamId/member/:memberId")
  .delete(isAuthenticated,authenticateOrgToken(),removeTeamMember);

// TeamRouter.route("/:teamId/archive")
//   .patch(toggleArchiveTeam);

TeamRouter.route("/:teamId/delete")
  .delete(isAuthenticated,authenticateOrgToken(),deleteTeam);

export default TeamRouter;