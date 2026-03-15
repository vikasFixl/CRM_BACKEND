import mongoose from "mongoose";
import logger from "../../../config/logger.js";
import { ReplenishmentSuggestion } from "../../models/SCM/ReplenishmentSuggestion.js";
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
    entityType: "ReplenishmentSuggestion",
    entityId,
    metadata,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
  });
};

export const getReplenishmentSuggestions = asyncHandler(async (req, res, next) => {
  try {
    const organizationId = getOrgId(req);
    if (!organizationId) return next(new ApiError(401, "Organization context missing"));

    const { page = 1, limit = 20, status, skuId } = req.query;
    const query = { organizationId };
    if (status) query.status = status;
    if (skuId) query.skuId = skuId;

    const [suggestions, total] = await Promise.all([
      ReplenishmentSuggestion.find(query)
        .sort({ createdAt: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit))
        .lean(),
      ReplenishmentSuggestion.countDocuments(query),
    ]);

    return res.status(200).json(
      new ApiResponse(200, "Replenishment suggestions fetched", {
        suggestions,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      })
    );
  } catch (error) {
    logger.error("Error in getReplenishmentSuggestions:", error);
    return next(new ApiError(error.statusCode || 500, error.message || "Internal Server Error"));
  }
});

export const approveReplenishment = asyncHandler(async (req, res, next) => {
  try {
    const organizationId = getOrgId(req);
    if (!organizationId) return next(new ApiError(401, "Organization context missing"));

    const { id } = req.params;
    const { vendorId, warehouseId } = req.body;
    if (!vendorId) return next(new ApiError(400, "vendorId is required"));
    if (!warehouseId) return next(new ApiError(400, "warehouseId is required"));

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ApiError(400, "Invalid suggestion id"));
    }

    const suggestion = await ReplenishmentSuggestion.findOne({ _id: id, organizationId });
    if (!suggestion) return next(new ApiError(404, "Suggestion not found"));
    if (suggestion.status === "rejected") {
      return next(new ApiError(400, "Rejected suggestions cannot be approved"));
    }
    if (suggestion.status === "converted_to_po") {
      return next(new ApiError(400, "Suggestion already converted to PO"));
    }

    const orderNumber = `PO-REPL-${Date.now()}`;
    const purchaseOrder = await PurchaseOrder.create({
      organizationId,
      vendorId,
      warehouseId,
      orderNumber,
      status: "draft",
      items: [
        {
          skuId: suggestion.skuId,
          quantity: suggestion.recommendedQty,
          unitPrice: 0,
          total: 0,
        },
      ],
      createdBy: getUserId(req),
      updatedBy: getUserId(req),
    });

    suggestion.status = "converted_to_po";
    suggestion.vendorId = vendorId;
    suggestion.updatedBy = getUserId(req);
    await suggestion.save();

    await createAuditLog({
      organizationId,
      userId: getUserId(req),
      action: "REPLENISHMENT_APPROVED",
      entityId: suggestion._id,
      metadata: { purchaseOrderId: purchaseOrder._id },
      req,
    });

    return res.status(200).json(
      new ApiResponse(200, "Replenishment approved and PO created", {
        suggestion,
        purchaseOrder,
      })
    );
  } catch (error) {
    logger.error("Error in approveReplenishment:", error);
    return next(new ApiError(error.statusCode || 500, error.message || "Internal Server Error"));
  }
});

export const rejectReplenishment = asyncHandler(async (req, res, next) => {
  try {
    const organizationId = getOrgId(req);
    if (!organizationId) return next(new ApiError(401, "Organization context missing"));

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ApiError(400, "Invalid suggestion id"));
    }

    const suggestion = await ReplenishmentSuggestion.findOne({ _id: id, organizationId });
    if (!suggestion) return next(new ApiError(404, "Suggestion not found"));
    if (suggestion.status === "converted_to_po") {
      return next(new ApiError(400, "Suggestion already converted to PO"));
    }
    if (suggestion.status === "rejected") {
      return next(new ApiError(400, "Suggestion already rejected"));
    }

    suggestion.status = "rejected";
    suggestion.updatedBy = getUserId(req);
    await suggestion.save();

    return res.status(200).json(new ApiResponse(200, "Replenishment rejected", suggestion));
  } catch (error) {
    logger.error("Error in rejectReplenishment:", error);
    return next(new ApiError(error.statusCode || 500, error.message || "Internal Server Error"));
  }
});

