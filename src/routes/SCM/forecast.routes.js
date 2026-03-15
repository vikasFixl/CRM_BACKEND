import express from "express";
import { isAuthenticated } from "../../middleweare/middleware.js";
import { authenticateOrgToken } from "../../middleweare/orgmiddleware.js";
import {
  runForecast,
  getForecasts,
  getForecastBySku,
} from "../../controllers/SCM/forecast.controller.js";

const router = express.Router();

router.post("/forecast/run", isAuthenticated, authenticateOrgToken(), runForecast);
router.get("/forecast", isAuthenticated, authenticateOrgToken(), getForecasts);
router.get("/forecast/:skuId", isAuthenticated, authenticateOrgToken(), getForecastBySku);

export default router;

