import mongoose from "mongoose";
import logger from "../../../config/logger.js";
import { Inventory } from "../../models/SCM/Inventory.js";
import { Warehouse } from "../../models/SCM/Warehouse.js";
import { GlobalInventorySnapshot } from "../../models/SCM/GlobalInventorySnapshot.js";
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
    entityType: "GlobalInventorySnapshot",
    entityId,
    metadata,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
  });
};

export const getGlobalInventory = asyncHandler(async (req, res, next) => {
  try {
    const organizationId = getOrgId(req);
    if (!organizationId) return next(new ApiError(401, "Organization context missing"));

    const warehouses = await Warehouse.find({ organizationId }).lean();
    const warehouseMap = new Map(warehouses.map((w) => [String(w._id), w.name]));

    const inventoryAgg = await Inventory.aggregate([
      { $match: { organizationId: new mongoose.Types.ObjectId(organizationId) } },
      {
        $group: {
          _id: { skuId: "$skuId", warehouseId: "$warehouseId" },
          available: { $sum: "$quantityAvailable" },
          reserved: { $sum: "$quantityReserved" },
        },
      },
    ]);

    const skuMap = new Map();
    for (const row of inventoryAgg) {
      const skuKey = String(row._id.skuId);
      if (!skuMap.has(skuKey)) {
        skuMap.set(skuKey, {
          skuId: row._id.skuId,
          totalAvailable: 0,
          totalReserved: 0,
          warehouseBreakdown: [],
        });
      }
      const item = skuMap.get(skuKey);
      item.totalAvailable += row.available;
      item.totalReserved += row.reserved;
      item.warehouseBreakdown.push({
        warehouseId: row._id.warehouseId,
        warehouseName: warehouseMap.get(String(row._id.warehouseId)) || null,
        available: row.available,
        reserved: row.reserved,
      });
    }

    const snapshots = [];
    for (const [, data] of skuMap) {
      const snap = await GlobalInventorySnapshot.findOneAndUpdate(
        { organizationId, skuId: data.skuId },
        {
          organizationId,
          skuId: data.skuId,
          totalAvailable: data.totalAvailable,
          totalReserved: data.totalReserved,
          warehouseBreakdown: data.warehouseBreakdown,
          updatedAt: new Date(),
        },
        { upsert: true, new: true }
      );
      snapshots.push(snap);

      await createAuditLog({
        organizationId,
        userId: getUserId(req),
        action: "GLOBAL_INVENTORY_REFRESHED",
        entityId: snap._id,
        metadata: { skuId: data.skuId },
        req,
      });
    }

    return res.status(200).json(new ApiResponse(200, "Global inventory fetched", snapshots));
  } catch (error) {
    logger.error("Error in getGlobalInventory:", error);
    return next(new ApiError(error.statusCode || 500, error.message || "Internal Server Error"));
  }
});

export const getGlobalInventoryBySku = asyncHandler(async (req, res, next) => {
  try {
    const organizationId = getOrgId(req);
    if (!organizationId) return next(new ApiError(401, "Organization context missing"));

    const { skuId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(skuId)) {
      return next(new ApiError(400, "Invalid skuId"));
    }

    const warehouses = await Warehouse.find({ organizationId }).lean();
    const warehouseMap = new Map(warehouses.map((w) => [String(w._id), w.name]));

    const inventoryAgg = await Inventory.aggregate([
      {
        $match: {
          organizationId: new mongoose.Types.ObjectId(organizationId),
          skuId: new mongoose.Types.ObjectId(skuId),
        },
      },
      {
        $group: {
          _id: { warehouseId: "$warehouseId" },
          available: { $sum: "$quantityAvailable" },
          reserved: { $sum: "$quantityReserved" },
        },
      },
    ]);

    let totalAvailable = 0;
    let totalReserved = 0;
    const breakdown = inventoryAgg.map((row) => {
      totalAvailable += row.available;
      totalReserved += row.reserved;
      return {
        warehouseId: row._id.warehouseId,
        warehouseName: warehouseMap.get(String(row._id.warehouseId)) || null,
        available: row.available,
        reserved: row.reserved,
      };
    });

    const snap = await GlobalInventorySnapshot.findOneAndUpdate(
      { organizationId, skuId },
      {
        organizationId,
        skuId,
        totalAvailable,
        totalReserved,
        warehouseBreakdown: breakdown,
        updatedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    await createAuditLog({
      organizationId,
      userId: getUserId(req),
      action: "GLOBAL_INVENTORY_REFRESHED",
      entityId: snap._id,
      metadata: { skuId },
      req,
    });

    return res.status(200).json(new ApiResponse(200, "Global inventory fetched", snap));
  } catch (error) {
    logger.error("Error in getGlobalInventoryBySku:", error);
    return next(new ApiError(error.statusCode || 500, error.message || "Internal Server Error"));
  }
});

