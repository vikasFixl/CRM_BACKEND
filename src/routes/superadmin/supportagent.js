import express from "express"
import { supportAgentLogin, supportOrgLogin } from "../../controllers/superAdmin/supportcontroller.js";
import { isAuthenticated } from "../../middleweare/middleware.js";
import { verifySupporOrgtoken, verifySupportoken } from "../../middleweare/superadmin.js";
import { getFirms, getLeads, getOrganization, getClients } from "../../controllers/superAdmin/supportOrgcontroller.js";
const SupportRouter=express.Router();


SupportRouter.route("/login").post(supportAgentLogin)
SupportRouter.route("/support-org-login").post(isAuthenticated,verifySupportoken,supportOrgLogin)



// org routtes
SupportRouter.route("/org").get(isAuthenticated,verifySupportoken,verifySupporOrgtoken,getOrganization)
SupportRouter.route("/firms").get(isAuthenticated,verifySupportoken,verifySupporOrgtoken,getFirms)
SupportRouter.route("/leads").get(isAuthenticated,verifySupportoken,verifySupporOrgtoken,getLeads)
SupportRouter.route("/clients").get(isAuthenticated,verifySupportoken,verifySupporOrgtoken,getClients)

export default SupportRouter

