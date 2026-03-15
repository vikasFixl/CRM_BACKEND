import mongoose from "mongoose";
import logger from "../../../config/logger.js";
import { Inventory } from "../../models/SCM/Inventory.js";
import { InventoryMovement } from "../../models/SCM/InventoryMovement.js";
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
    entityType: "Inventory",
    entityId,
    metadata,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
  });
};

export const getInventory = asyncHandler(async (req, res, next) => {
  try {
    const organizationId = getOrgId(req);
    if (!organizationId) return next(new ApiError(401, "Organization context missing"));

    const { page = 1, limit = 20, skuId, warehouseId } = req.query;
    const query = { organizationId };
    if (skuId) query.skuId = skuId;
    if (warehouseId) query.warehouseId = warehouseId;

    const [items, total] = await Promise.all([
      Inventory.find(query)
        .sort({ createdAt: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit))
        .lean(),
      Inventory.countDocuments(query),
    ]);

    return res.status(200).json(
      new ApiResponse(200, "Inventory fetched successfully", {
        items,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      })
    );
  } catch (error) {
    logger.error("Error in getInventory:", error);
    return next(new ApiError(error.statusCode || 500, error.message || "Internal Server Error"));
  }
});

export const getInventoryBySku = asyncHandler(async (req, res, next) => {
  try {
    const organizationId = getOrgId(req);
    if (!organizationId) return next(new ApiError(401, "Organization context missing"));

    const { skuId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(skuId)) {
      return next(new ApiError(400, "Invalid skuId"));
    }

    const items = await Inventory.find({ organizationId, skuId })
      .sort({ createdAt: -1 })
      .lean();

    return res
      .status(200)
      .json(new ApiResponse(200, "Inventory fetched successfully", items));
  } catch (error) {
    logger.error("Error in getInventoryBySku:", error);
    return next(new ApiError(error.statusCode || 500, error.message || "Internal Server Error"));
  }
});

export const adjustInventory = asyncHandler(async (req, res, next) => {
  try {
    const organizationId = getOrgId(req);
    if (!organizationId) return next(new ApiError(401, "Organization context missing"));

    const { skuId, warehouseId, warehouseLocationId, quantity, note } = req.body;
    if (!skuId || !warehouseId || typeof quantity !== "number") {
      return next(new ApiError(400, "skuId, warehouseId, and quantity are required"));
    }

    let inventory = await Inventory.findOne({ organizationId, skuId, warehouseId });
    if (inventory) {
      const newQty = inventory.quantityAvailable + quantity;
      if (newQty < 0) return next(new ApiError(400, "Inventory cannot go below zero"));
      inventory.quantityAvailable = newQty;
      inventory.updatedBy = getUserId(req);
      if (warehouseLocationId) inventory.warehouseLocationId = warehouseLocationId;
      await inventory.save();
    } else {
      if (quantity < 0) return next(new ApiError(400, "Inventory cannot go below zero"));
      inventory = await Inventory.create({
        organizationId,
        skuId,
        warehouseId,
        warehouseLocationId,
        quantityAvailable: quantity,
        quantityReserved: 0,
        reorderLevel: 0,
        createdBy: getUserId(req),
        updatedBy: getUserId(req),
      });
    }

    await InventoryMovement.create({
      organizationId,
      skuId,
      warehouseId,
      warehouseLocationId,
      movementType: "ADJUSTMENT",
      quantity,
      referenceType: "ManualAdjustment",
      note,
      createdBy: getUserId(req),
    });

    await createAuditLog({
      organizationId,
      userId: getUserId(req),
      action: "SCM_INVENTORY_ADJUSTED",
      entityId: inventory._id,
      metadata: { skuId, warehouseId, quantity },
      req,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, "Inventory adjusted successfully", inventory));
  } catch (error) {
    logger.error("Error in adjustInventory:", error);
    return next(new ApiError(error.statusCode || 500, error.message || "Internal Server Error"));
  }
});

