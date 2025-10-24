import express from "express"
const PositionRouter = express.Router()
import { isAuthenticated } from "../../../middleweare/middleware.js"
import { authenticateOrgToken } from "../../../middleweare/orgmiddleware.js"
import { createPosition, deletePosition, getPosition, getPositions, TogglePositionStatus, updatePosition } from "../../../controllers/NHRM/EmployeeController/positionController.js"






PositionRouter.route("/").post(isAuthenticated,authenticateOrgToken(),createPosition)
PositionRouter.route("/all").get(isAuthenticated,authenticateOrgToken(),getPositions)
PositionRouter.route("/:positionId").get(isAuthenticated,authenticateOrgToken(),getPosition).patch(isAuthenticated,authenticateOrgToken(),updatePosition).delete(isAuthenticated,authenticateOrgToken(),deletePosition).post(isAuthenticated,authenticateOrgToken(),TogglePositionStatus)
export default PositionRouter;