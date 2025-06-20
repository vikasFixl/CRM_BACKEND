import express from "express";
import {
  postGlobalTax,
  addTaxInFirm,
  clientByTax,
  invoiceByTax,
  gettaxrates,
  getGlobalTaxs,
  getAllTaxes,
  
  deletetaxRate,
  disabletaxRate,
  updateTaxRateById,
  enableTaxRate,
} from "../controllers/taxRates.js";
import { isAuthenticated } from "../middleweare/middleware.js";
import { authenticateOrgToken } from "../middleweare/orgmiddleware.js";
const TaxRouter = express.Router();

TaxRouter.route("/postGlobalTax").post(isAuthenticated, authenticateOrgToken(), postGlobalTax);
TaxRouter.route("/addTaxInFirm").post(isAuthenticated, authenticateOrgToken(), addTaxInFirm);
TaxRouter.route("/clientByTax").post(isAuthenticated, authenticateOrgToken(), clientByTax);
TaxRouter.route("/invoiceByTax").post(isAuthenticated, authenticateOrgToken(), invoiceByTax);

TaxRouter.route("/gettaxRates/:firmId").get(isAuthenticated, authenticateOrgToken(), gettaxrates);
TaxRouter.route("/getGlobalTaxs").get(isAuthenticated, authenticateOrgToken(), getGlobalTaxs);
TaxRouter.route("/getAllTaxes").get(isAuthenticated, authenticateOrgToken(), getAllTaxes);

TaxRouter.route("/updateRates/:id").patch(isAuthenticated, authenticateOrgToken(), updateTaxRateById)
TaxRouter.route("/disableTax/:id").patch(isAuthenticated, authenticateOrgToken(), disabletaxRate);
TaxRouter.route("/enableTax/:id").patch(isAuthenticated, authenticateOrgToken(), enableTaxRate);
TaxRouter.route("/delete/:id/:oid").delete(deletetaxRate);

export default TaxRouter;
