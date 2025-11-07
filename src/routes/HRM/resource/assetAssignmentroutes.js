import express from "express";
import { isAuthenticated } from "../../../middleweare/middleware.js";
import { authenticateOrgToken } from "../../../middleweare/orgmiddleware.js";
import { assignAsset,returnAsset } from "../../../controllers/NHRM/resource/assetAssignmentController.js";
const AssetAssignmentRouter=express.Router()



AssetAssignmentRouter.route("/").post(isAuthenticated,authenticateOrgToken(),assignAsset)
AssetAssignmentRouter.route("/:assetId/return").post(isAuthenticated,authenticateOrgToken(),returnAsset)

export default AssetAssignmentRouter;