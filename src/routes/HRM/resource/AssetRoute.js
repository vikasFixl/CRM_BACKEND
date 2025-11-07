import express from "express";
import { isAuthenticated } from "../../../middleweare/middleware.js";
import { authenticateOrgToken } from "../../../middleweare/orgmiddleware.js";
import { createAsset,getAllAssets,updateAsset,deleteAsset,getMyAssignedAssets,GetAssetById } from "../../../controllers/NHRM/resource/AssetController.js";

const AssetRouter = express.Router();


AssetRouter.route("/").post(isAuthenticated,authenticateOrgToken(),createAsset)
AssetRouter.route("/all").get(isAuthenticated,authenticateOrgToken(),getAllAssets)
AssetRouter.route("/:assetId").patch(isAuthenticated,authenticateOrgToken(),updateAsset).delete(isAuthenticated,authenticateOrgToken(),deleteAsset).get(isAuthenticated,authenticateOrgToken(),GetAssetById)
AssetRouter.route("/assets/assigned").get(isAuthenticated,authenticateOrgToken(),getMyAssignedAssets)




export default AssetRouter;