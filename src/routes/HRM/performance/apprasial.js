import express from "express"
import { isAuthenticated } from "../../../middleweare/middleware.js";
import { authenticateOrgToken } from "../../../middleweare/orgmiddleware.js";
import { createAppraisal, deleteAppraisal, getAppraisalById, getAppraisals, updateAppraisal } from "../../../controllers/NHRM/performance/performanceAppraisals.js";
const ApprasialRouter = express.Router();

// CREATE
ApprasialRouter
  .route("/")
  .post(isAuthenticated, authenticateOrgToken(), createAppraisal)
  .get(isAuthenticated, authenticateOrgToken(), getAppraisals);

// READ ONE
ApprasialRouter
  .route("/:id")
  .get(isAuthenticated, authenticateOrgToken(), getAppraisalById)
  .put(isAuthenticated, authenticateOrgToken(), updateAppraisal)
  .delete(isAuthenticated, authenticateOrgToken(), deleteAppraisal);

  ApprasialRouter.route("/all").get(isAuthenticated,authenticateOrgToken(),getAppraisals)


ApprasialRouter.route("/").post(isAuthenticated,authenticateOrgToken(),createAppraisal)








export default ApprasialRouter;