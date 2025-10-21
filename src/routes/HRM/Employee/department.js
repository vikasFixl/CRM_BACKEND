import express from "express"
const DepartmentRouter = express.Router()
import { isAuthenticated } from "../../../middleweare/middleware.js"
import { authenticateOrgToken } from "../../../middleweare/orgmiddleware.js"
import { createDepartment, GetDepartmentList, getDepartments } from "../../../controllers/NHRM/EmployeeController/DepartmentController.js"

DepartmentRouter.route("/").post(isAuthenticated,authenticateOrgToken(),createDepartment)
DepartmentRouter.route("/all").get(isAuthenticated,authenticateOrgToken(),getDepartments)
DepartmentRouter.route("/list").get(isAuthenticated,authenticateOrgToken(),GetDepartmentList)





export default DepartmentRouter