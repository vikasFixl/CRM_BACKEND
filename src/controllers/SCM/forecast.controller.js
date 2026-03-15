import mongoose from "mongoose";
import logger from "../../../config/logger.js";
import { DemandForecast } from "../../models/SCM/DemandForecast.js";
import { ReplenishmentSuggestion } from "../../models/SCM/ReplenishmentSuggestion.js";
import { Order } from "../../models/SCM/Order.js";
import { Inventory } from "../../models/SCM/Inventory.js";
import { PurchaseOrder } from "../../models/SCM/PurchaseOrder.js";
import { AuditLog } from "../../models/SCM/AuditLog.js";
import { asyncHandler } from "../../middleweare/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

const getOrgId = (req) => req.orgUser?.orgId;
const getUserId = (req) => req.orgUser?.userId || req.user?.userId || null;

const createAuditLog = async ({ organizationId, userId, action, entityId, metadata, req }) => {
  await AuditLog.create({
    organizationId,
    userId,
    action,
    entityType: "DemandForecast",
    entityId,
    metadata,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
  });
};

export const runForecast = asyncHandler(async (req, res, next) => {
  try {
    const organizationId = getOrgId(req);
    if (!organizationId) return next(new ApiError(401, "Organization context missing"));

    const period = "30days";
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const salesAgg = await Order.aggregate([
      {
        $match: {
          organizationId: new mongoose.Types.ObjectId(organizationId),
          createdAt: { $gte: startDate },
          status: { $in: ["shipped", "delivered"] },
        },
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.skuId",
          totalQty: { $sum: "$items.quantity" },
        },
      },
    ]);

    const forecastResults = [];
    for (const row of salesAgg) {
      const forecastQuantity = Math.max(0, Number(row.totalQty || 0));
      const confidenceScore = forecastQuantity > 0 ? 0.7 : 0.3;

      const forecast = await DemandForecast.findOneAndUpdate(
        { organizationId, skuId: row._id, period },
        {
          organizationId,
          skuId: row._id,
          period,
          forecastQuantity,
          confidenceScore,
          generatedAt: new Date(),
          updatedBy: getUserId(req),
        },
        { upsert: true, new: true }
      );

      forecastResults.push(forecast);

      await createAuditLog({
        organizationId,
        userId: getUserId(req),
        action: "FORECAST_GENERATED",
        entityId: forecast._id,
        metadata: { skuId: row._id, forecastQuantity, period },
        req,
      });
    }

    const inventoryAgg = await Inventory.aggregate([
      { $match: { organizationId: new mongoose.Types.ObjectId(organizationId) } },
      { $group: { _id: "$skuId", available: { $sum: "$quantityAvailable" } } },
    ]);
    const availableMap = new Map(inventoryAgg.map((i) => [String(i._id), i.available]));

    const incomingAgg = await PurchaseOrder.aggregate([
      {
        $match: {
          organizationId: new mongoose.Types.ObjectId(organizationId),
          status: { $in: ["approved", "sent"] },
        },
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.skuId",
          incoming: {
            $sum: {
              $subtract: [
                "$items.quantity",
                { $ifNull: ["$items.receivedQuantity", 0] },
              ],
            },
          },
        },
      },
    ]);
    const incomingMap = new Map(incomingAgg.map((i) => [String(i._id), i.incoming]));

    const suggestions = [];
    for (const forecast of forecastResults) {
      const skuKey = String(forecast.skuId);
      const available = Number(availableMap.get(skuKey) || 0);
      const incoming = Number(incomingMap.get(skuKey) || 0);
      const stockRisk = Number(forecast.forecastQuantity || 0) - (available + incoming);

      if (stockRisk > 0) {
        const reason = `Forecasted demand exceeds available and incoming stock by ${stockRisk} units`;

        const existing = await ReplenishmentSuggestion.findOne({
          organizationId,
          skuId: forecast.skuId,
          status: { $in: ["generated", "approved"] },
        });

        if (existing) {
          existing.recommendedQty = stockRisk;
          existing.reason = reason;
          existing.updatedBy = getUserId(req);
          await existing.save();
          suggestions.push(existing);
        } else {
          const suggestion = await ReplenishmentSuggestion.create({
            organizationId,
            skuId: forecast.skuId,
            recommendedQty: stockRisk,
            status: "generated",
            reason,
            forecastId: forecast._id,
            createdBy: getUserId(req),
            updatedBy: getUserId(req),
          });
          suggestions.push(suggestion);

          await AuditLog.create({
            organizationId,
            userId: getUserId(req),
            action: "REPLENISHMENT_SUGGESTED",
            entityType: "ReplenishmentSuggestion",
            entityId: suggestion._id,
            metadata: { skuId: forecast.skuId, recommendedQty: stockRisk },
            ipAddress: req.ip,
            userAgent: req.headers["user-agent"],
          });
        }
      }
    }

    return res.status(200).json(
      new ApiResponse(200, "Forecast generated", {
        forecasts: forecastResults,
        suggestions,
      })
    );
  } catch (error) {
    logger.error("Error in runForecast:", error);
    return next(new ApiError(error.statusCode || 500, error.message || "Internal Server Error"));
  }
});

export const getForecasts = asyncHandler(async (req, res, next) => {
  try {
    const organizationId = getOrgId(req);
    if (!organizationId) return next(new ApiError(401, "Organization context missing"));

    const { page = 1, limit = 20, period } = req.query;
    const query = { organizationId };
    if (period) query.period = period;

    const [forecasts, total] = await Promise.all([
      DemandForecast.find(query)
        .sort({ generatedAt: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit))
        .lean(),
      DemandForecast.countDocuments(query),
    ]);

    return res.status(200).json(
      new ApiResponse(200, "Forecasts fetched", {
        forecasts,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      })
    );
  } catch (error) {
    logger.error("Error in getForecasts:", error);
    return next(new ApiError(error.statusCode || 500, error.message || "Internal Server Error"));
  }
});

export const getForecastBySku = asyncHandler(async (req, res, next) => {
  try {
    const organizationId = getOrgId(req);
    if (!organizationId) return next(new ApiError(401, "Organization context missing"));

    const { skuId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(skuId)) {
      return next(new ApiError(400, "Invalid skuId"));
    }

    const forecast = await DemandForecast.findOne({ organizationId, skuId }).lean();
    if (!forecast) return next(new ApiError(404, "Forecast not found"));

    return res.status(200).json(new ApiResponse(200, "Forecast fetched", forecast));
  } catch (error) {
    logger.error("Error in getForecastBySku:", error);
    return next(new ApiError(error.statusCode || 500, error.message || "Internal Server Error"));
  }
});

