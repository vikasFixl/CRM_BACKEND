import express from "express"
const EmployeeRouter = express.Router()
import { isAuthenticated } from "../../../middleweare/middleware.js"
import { authenticateOrgToken } from "../../../middleweare/orgmiddleware.js"
import { createEmployee, deleteEmployee, getEmployeeById, getEmployees, updateEmployeeProfile} from "../../../controllers/NHRM/EmployeeController/employeeController.js"

EmployeeRouter.route("/").post(isAuthenticated,authenticateOrgToken(),createEmployee)
EmployeeRouter.route("/all").get(isAuthenticated,authenticateOrgToken(),getEmployees)
EmployeeRouter.route("/:employeeId").get(isAuthenticated,authenticateOrgToken(),getEmployeeById)
EmployeeRouter.route("/delete/:employeeId").delete(isAuthenticated,authenticateOrgToken(),deleteEmployee)
EmployeeRouter.route("/update/:employeeId").patch(isAuthenticated,authenticateOrgToken(),updateEmployeeProfile)



export default EmployeeRouter;