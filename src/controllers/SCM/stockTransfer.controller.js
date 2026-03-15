import mongoose from "mongoose";
import logger from "../../../config/logger.js";
import { StockTransfer } from "../../models/SCM/StockTransfer.js";
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
    entityType: "StockTransfer",
    entityId,
    metadata,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
  });
};

export const createStockTransfer = asyncHandler(async (req, res, next) => {
  try {
    const organizationId = getOrgId(req);
    if (!organizationId) return next(new ApiError(401, "Organization context missing"));

    const { skuId, sourceWarehouseId, destinationWarehouseId, quantity } = req.body;
    if (!skuId || !sourceWarehouseId || !destinationWarehouseId || !quantity) {
      return next(new ApiError(400, "skuId, sourceWarehouseId, destinationWarehouseId, quantity required"));
    }

    const transfer = await StockTransfer.create({
      organizationId,
      skuId,
      sourceWarehouseId,
      destinationWarehouseId,
      quantity,
      status: "requested",
      createdBy: getUserId(req),
      updatedBy: getUserId(req),
    });

    await createAuditLog({
      organizationId,
      userId: getUserId(req),
      action: "STOCK_TRANSFER_CREATED",
      entityId: transfer._id,
      metadata: { skuId, quantity, sourceWarehouseId, destinationWarehouseId },
      req,
    });

    return res.status(201).json(new ApiResponse(201, "Stock transfer created", transfer));
  } catch (error) {
    logger.error("Error in createStockTransfer:", error);
    return next(new ApiError(error.statusCode || 500, error.message || "Internal Server Error"));
  }
});

export const getStockTransfers = asyncHandler(async (req, res, next) => {
  try {
    const organizationId = getOrgId(req);
    if (!organizationId) return next(new ApiError(401, "Organization context missing"));

    const { page = 1, limit = 20, status, skuId } = req.query;
    const query = { organizationId };
    if (status) query.status = status;
    if (skuId) query.skuId = skuId;

    const [transfers, total] = await Promise.all([
      StockTransfer.find(query)
        .sort({ createdAt: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit))
        .lean(),
      StockTransfer.countDocuments(query),
    ]);

    return res.status(200).json(
      new ApiResponse(200, "Stock transfers fetched", {
        transfers,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      })
    );
  } catch (error) {
    logger.error("Error in getStockTransfers:", error);
    return next(new ApiError(error.statusCode || 500, error.message || "Internal Server Error"));
  }
});

export const approveStockTransfer = asyncHandler(async (req, res, next) => {
  try {
    const organizationId = getOrgId(req);
    if (!organizationId) return next(new ApiError(401, "Organization context missing"));

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ApiError(400, "Invalid stock transfer id"));
    }

    const transfer = await StockTransfer.findOne({ _id: id, organizationId });
    if (!transfer) return next(new ApiError(404, "Stock transfer not found"));
    if (transfer.status === "completed") {
      return next(new ApiError(400, "Completed transfer cannot be approved"));
    }
    if (transfer.status !== "requested") {
      return next(new ApiError(400, "Only requested transfers can be approved"));
    }

    transfer.status = "in_transit";
    transfer.updatedBy = getUserId(req);
    await transfer.save();

    return res.status(200).json(new ApiResponse(200, "Stock transfer approved", transfer));
  } catch (error) {
    logger.error("Error in approveStockTransfer:", error);
    return next(new ApiError(error.statusCode || 500, error.message || "Internal Server Error"));
  }
});

export const completeStockTransfer = asyncHandler(async (req, res, next) => {
  const session = await mongoose.startSession();
  let transactionStarted = false;
  try {
    const organizationId = getOrgId(req);
    if (!organizationId) throw new ApiError(401, "Organization context missing");

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid stock transfer id");
    }

    session.startTransaction();
    transactionStarted = true;

    const transfer = await StockTransfer.findOne({ _id: id, organizationId }).session(session);
    if (!transfer) throw new ApiError(404, "Stock transfer not found");
    if (!["approved", "in_transit"].includes(transfer.status)) {
      throw new ApiError(400, "Only approved or in_transit transfers can be completed");
    }

    const sourceInv = await Inventory.findOne({
      organizationId,
      skuId: transfer.skuId,
      warehouseId: transfer.sourceWarehouseId,
    }).session(session);

    if (!sourceInv || sourceInv.quantityAvailable < transfer.quantity) {
      throw new ApiError(400, "Insufficient source warehouse inventory");
    }

    sourceInv.quantityAvailable -= transfer.quantity;
    await sourceInv.save({ session });

    const destInv = await Inventory.findOne({
      organizationId,
      skuId: transfer.skuId,
      warehouseId: transfer.destinationWarehouseId,
    }).session(session);

    if (destInv) {
      destInv.quantityAvailable += transfer.quantity;
      await destInv.save({ session });
    } else {
      await Inventory.create(
        [
          {
            organizationId,
            skuId: transfer.skuId,
            warehouseId: transfer.destinationWarehouseId,
            quantityAvailable: transfer.quantity,
            quantityReserved: 0,
            reorderLevel: 0,
            createdBy: getUserId(req),
            updatedBy: getUserId(req),
          },
        ],
        { session }
      );
    }

    await InventoryMovement.create(
      [
        {
          organizationId,
          skuId: transfer.skuId,
          warehouseId: transfer.sourceWarehouseId,
          movementType: "TRANSFER_OUT",
          quantity: transfer.quantity,
          referenceId: transfer._id,
          referenceType: "StockTransfer",
          createdBy: getUserId(req),
        },
        {
          organizationId,
          skuId: transfer.skuId,
          warehouseId: transfer.destinationWarehouseId,
          movementType: "TRANSFER_IN",
          quantity: transfer.quantity,
          referenceId: transfer._id,
          referenceType: "StockTransfer",
          createdBy: getUserId(req),
        },
      ],
      { session }
    );

    transfer.status = "completed";
    transfer.updatedBy = getUserId(req);
    await transfer.save({ session });

    await createAuditLog({
      organizationId,
      userId: getUserId(req),
      action: "STOCK_TRANSFER_COMPLETED",
      entityId: transfer._id,
      metadata: { skuId: transfer.skuId, quantity: transfer.quantity },
      req,
    });

    await session.commitTransaction();
    return res.status(200).json(new ApiResponse(200, "Stock transfer completed", transfer));
  } catch (error) {
    if (transactionStarted) await session.abortTransaction();
    logger.error("Error in completeStockTransfer:", error);
    return next(new ApiError(error.statusCode || 500, error.message || "Internal Server Error"));
  } finally {
    session.endSession();
  }
});

