import express from "express"
const JobRouter = express.Router()
import { isAuthenticated } from "../../../middleweare/middleware.js"
import { authenticateOrgToken } from "../../../middleweare/orgmiddleware.js"
import { closeJobPosting, createJobPosting, getJobPosting, getJobPostings, updateJobPosting } from "../../../controllers/NHRM/Recruitment/JobPostingController.js"

JobRouter.route("/").post(isAuthenticated,authenticateOrgToken(),createJobPosting)
JobRouter.route("/update/:jobId").patch(isAuthenticated,authenticateOrgToken(),updateJobPosting)
JobRouter.route("/all").get(isAuthenticated,authenticateOrgToken(),getJobPostings)
JobRouter.route("/:jobId").get(isAuthenticated,authenticateOrgToken(),getJobPosting)
JobRouter.route("/:jobId").patch(isAuthenticated,authenticateOrgToken(),closeJobPosting)

export default JobRouter;