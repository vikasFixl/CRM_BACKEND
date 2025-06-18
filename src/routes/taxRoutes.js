import express from "express";
import {
  postGlobalTax,
  addTaxInFirm,
  clientByTax,
  invoiceByTax,
  gettaxrates,
  getGlobalTaxs,
  getAllTaxes,
  updatetaxrates,
  deletetaxRate,
  disabletaxRate,
} from "../controllers/taxRates.js";
import { isAuthenticated } from "../middleweare/middleware.js";
import { authenticateOrgToken } from "../middleweare/orgmiddleware.js";
const TaxRouter = express.Router();

TaxRouter.route("/postGlobalTax").post(isAuthenticated, authenticateOrgToken(), postGlobalTax);
TaxRouter.route("/addTaxInFirm").post(isAuthenticated, authenticateOrgToken(), addTaxInFirm);
TaxRouter.route("/clientByTax").post(clientByTax);
TaxRouter.route("/invoiceByTax").post(invoiceByTax);

TaxRouter.route("/gettaxRates/:firmId").get(isAuthenticated, authenticateOrgToken(), gettaxrates);
TaxRouter.route("/getGlobalTaxs").get(isAuthenticated, authenticateOrgToken(), getGlobalTaxs);
TaxRouter.route("/getAllTaxes").get(isAuthenticated, authenticateOrgToken(), getAllTaxes);

TaxRouter.route("/updateRates/:id").patch(updatetaxrates);
TaxRouter.route("/disableTax/:id").patch(isAuthenticated, authenticateOrgToken(), disabletaxRate);
TaxRouter.route("/delete/:id/:oid").delete(deletetaxRate);

export default TaxRouter;
