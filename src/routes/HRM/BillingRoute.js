import express from "express";
import { createBillingPlan,getAllBillingPlans ,getBillingPlanById,updateBillingPlan,deleteBillingPlan} from "../../controllers/BillingPlanController.js";
import { isAuthenticated } from "../../middleweare/middleware.js";
const Router = express.Router();

Router.route("/createBillingPlan").post( isAuthenticated,createBillingPlan);

// get al plans
Router.route("/getAllBillingPlans").get(getAllBillingPlans);

// get plan by id
Router.route("/getBillingPlan/:id").get((req, res) => {
  res.send("getBillingPlan by id");
});

// update by id
Router.route("/updateBillingPlan/:id").put((req, res) => {
  res.send("updateBillingPlan");
});
// delete by id
Router.route("/deleteBillingPlan/:id").delete((req, res) => {
  res.send("delteBillingPlan");
});

export default Router;
