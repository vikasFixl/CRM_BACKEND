import express from "express"
import { isAuthenticated } from "../../../middleweare/middleware.js"
import { authenticateOrgToken } from "../../../middleweare/orgmiddleware.js"
import { deleteOnboarding, getOnboardingByEmployee, getOnboardings, initiateOnboarding, updateOnboardingStatus } from "../../../controllers/NHRM/EmployeeController/onboardingController.js"
const OnboardingRouter = express.Router()

OnboardingRouter.route("/initiate/:employeeId").post(
  isAuthenticated,
  authenticateOrgToken(),
  initiateOnboarding
);

OnboardingRouter.route("/employee/:employeeId").get(
  isAuthenticated,
  authenticateOrgToken(),
  getOnboardingByEmployee
);

OnboardingRouter.route("/status/:onboardingId").patch(
  isAuthenticated,
  authenticateOrgToken(),
  updateOnboardingStatus
);

// 👇 This is what you asked for
OnboardingRouter.route("/all").get(
  isAuthenticated,
  authenticateOrgToken(),
  getOnboardings
);

OnboardingRouter.route("/:onboardingId").delete(
  isAuthenticated,
  authenticateOrgToken(),
  deleteOnboarding
);





export default OnboardingRouter