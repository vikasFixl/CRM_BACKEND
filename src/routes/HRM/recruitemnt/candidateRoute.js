import express from "express"
const CandidateRouter = express.Router()
import { isAuthenticated } from "../../../middleweare/middleware.js"
import { authenticateOrgToken } from "../../../middleweare/orgmiddleware.js"
import { createCandidate, deleteCandidate, getCandidate, getCandidates, getCandidatesList, updateCandidate, updateCandidateStatus } from "../../../controllers/NHRM/Recruitment/CandidateController.js"

CandidateRouter.route("/").post(isAuthenticated,authenticateOrgToken(),createCandidate)
// CandidateRouter.route("/update/:candidateId").patch(isAuthenticated,authenticateOrgToken(),updateCandidate)
CandidateRouter.route("/all").get(isAuthenticated,authenticateOrgToken(),getCandidates)
CandidateRouter.route("/list").get(isAuthenticated,authenticateOrgToken(),getCandidatesList)
CandidateRouter.route("/:candidateId").get(isAuthenticated,authenticateOrgToken(),getCandidate).patch(isAuthenticated,authenticateOrgToken(),updateCandidate)
CandidateRouter.route("/:candidateId").delete(isAuthenticated,authenticateOrgToken(),deleteCandidate)
// CandidateRouter.route("/move-to-interview/:candidateId").post(isAuthenticated,authenticateOrgToken(),MovetoInterview)
// CandidateRouter.route("/move-to-offer/:candidateId").post(isAuthenticated,authenticateOrgToken(),moveToOffer)
CandidateRouter.route("/update-status/:candidateId").patch(
  isAuthenticated,
  authenticateOrgToken(),
  updateCandidateStatus
);


export default CandidateRouter;