import express from "express"
const PositionRouter = express.Router()
import { isAuthenticated } from "../../../middleweare/middleware.js"
import { authenticateOrgToken } from "../../../middleweare/orgmiddleware.js"
import { createPosition, deletePosition, getPosition, getPositions, updatePosition } from "../../../controllers/NHRM/EmployeeController/positionController.js"






PositionRouter.route("/").post(isAuthenticated,authenticateOrgToken(),createPosition)
PositionRouter.route("/all").get(isAuthenticated,authenticateOrgToken(),getPositions)
PositionRouter.route("/:id").get(isAuthenticated,authenticateOrgToken(),getPosition).patch(isAuthenticated,authenticateOrgToken(),updatePosition).delete(isAuthenticated,authenticateOrgToken(),deletePosition)
export default PositionRouter;