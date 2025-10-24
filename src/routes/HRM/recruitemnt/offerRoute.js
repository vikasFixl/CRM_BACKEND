import express from "express"
const OfferRouter = express.Router()
import { isAuthenticated } from "../../../middleweare/middleware.js"
import { authenticateOrgToken } from "../../../middleweare/orgmiddleware.js"
import { createOffer, deleteOffer,  getAllOffers,  getOfferById, getOffersByCandidateId, updateOffer, updateOfferStatus } from "../../../controllers/NHRM/Recruitment/OfferController.js"

OfferRouter.route("/").post(isAuthenticated,authenticateOrgToken(),createOffer)
OfferRouter.route("/update/:offerId").patch(isAuthenticated,authenticateOrgToken(),updateOffer)
OfferRouter.route("/all").get(isAuthenticated,authenticateOrgToken(),getAllOffers)
OfferRouter.route("/:offerId").get(isAuthenticated,authenticateOrgToken(),getOfferById).delete(isAuthenticated,authenticateOrgToken(),deleteOffer).patch(isAuthenticated,authenticateOrgToken(),updateOfferStatus)
OfferRouter.route("/candidate/:candidateId").get(isAuthenticated,authenticateOrgToken(),getOffersByCandidateId)

export default OfferRouter