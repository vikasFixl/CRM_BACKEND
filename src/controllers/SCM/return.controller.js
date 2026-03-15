import mongoose from "mongoose";
import logger from "../../../config/logger.js";
import { ReturnOrder } from "../../models/SCM/ReturnOrder.js";
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
    entityType: "ReturnOrder",
    entityId,
    metadata,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
  });
};

export const createReturn = asyncHandler(async (req, res, next) => {
  try {
    const organizationId = getOrgId(req);
    if (!organizationId) return next(new ApiError(401, "Organization context missing"));

    const { orderId, items, reason } = req.body;
    if (!orderId) return next(new ApiError(400, "orderId is required"));
    if (!Array.isArray(items) || items.length === 0) {
      return next(new ApiError(400, "items must be a non-empty array"));
    }
    if (!reason) return next(new ApiError(400, "reason is required"));

    const returnOrder = await ReturnOrder.create({
      organizationId,
      orderId,
      items,
      reason,
      status: "requested",
      createdBy: getUserId(req),
      updatedBy: getUserId(req),
    });

    await createAuditLog({
      organizationId,
      userId: getUserId(req),
      action: "RETURN_REQUESTED",
      entityId: returnOrder._id,
      metadata: { orderId },
      req,
    });

    return res.status(201).json(new ApiResponse(201, "Return requested", returnOrder));
  } catch (error) {
    logger.error("Error in createReturn:", error);
    return next(new ApiError(error.statusCode || 500, error.message || "Internal Server Error"));
  }
});

export const getReturns = asyncHandler(async (req, res, next) => {
  try {
    const organizationId = getOrgId(req);
    if (!organizationId) return next(new ApiError(401, "Organization context missing"));

    const { page = 1, limit = 20, status, orderId } = req.query;
    const query = { organizationId };
    if (status) query.status = status;
    if (orderId) query.orderId = orderId;

    const [returns, total] = await Promise.all([
      ReturnOrder.find(query)
        .sort({ createdAt: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit))
        .lean(),
      ReturnOrder.countDocuments(query),
    ]);

    return res.status(200).json(
      new ApiResponse(200, "Returns fetched", {
        returns,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      })
    );
  } catch (error) {
    logger.error("Error in getReturns:", error);
    return next(new ApiError(error.statusCode || 500, error.message || "Internal Server Error"));
  }
});

export const approveReturn = asyncHandler(async (req, res, next) => {
  try {
    const organizationId = getOrgId(req);
    if (!organizationId) return next(new ApiError(401, "Organization context missing"));

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ApiError(400, "Invalid return id"));
    }

    const returnOrder = await ReturnOrder.findOne({ _id: id, organizationId });
    if (!returnOrder) return next(new ApiError(404, "Return not found"));
    if (returnOrder.status !== "requested") {
      return next(new ApiError(400, "Only requested returns can be approved"));
    }

    returnOrder.status = "approved";
    returnOrder.updatedBy = getUserId(req);
    await returnOrder.save();

    await createAuditLog({
      organizationId,
      userId: getUserId(req),
      action: "RETURN_APPROVED",
      entityId: returnOrder._id,
      metadata: { orderId: returnOrder.orderId },
      req,
    });

    return res.status(200).json(new ApiResponse(200, "Return approved", returnOrder));
  } catch (error) {
    logger.error("Error in approveReturn:", error);
    return next(new ApiError(error.statusCode || 500, error.message || "Internal Server Error"));
  }
});

export const receiveReturn = asyncHandler(async (req, res, next) => {
  const session = await mongoose.startSession();
  let transactionStarted = false;
  try {
    const organizationId = getOrgId(req);
    if (!organizationId) throw new ApiError(401, "Organization context missing");

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid return id");
    }

    session.startTransaction();
    transactionStarted = true;

    const returnOrder = await ReturnOrder.findOne({ _id: id, organizationId }).session(session);
    if (!returnOrder) throw new ApiError(404, "Return not found");
    if (returnOrder.status !== "approved") {
      throw new ApiError(400, "Only approved returns can be received");
    }

    const warehouseId = req.body.warehouseId;
    if (!warehouseId) throw new ApiError(400, "warehouseId is required to receive return");

    for (const item of returnOrder.items) {
      const inv = await Inventory.findOne({
        organizationId,
        skuId: item.skuId,
        warehouseId,
      }).session(session);

      if (inv) {
        inv.quantityAvailable += item.quantity;
        await inv.save({ session });
      } else {
        await Inventory.create(
          [
            {
              organizationId,
              skuId: item.skuId,
              warehouseId,
              quantityAvailable: item.quantity,
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
            skuId: item.skuId,
            warehouseId,
            movementType: "RETURN",
            quantity: item.quantity,
            referenceId: returnOrder._id,
            referenceType: "ReturnOrder",
            createdBy: getUserId(req),
          },
        ],
        { session }
      );
    }

    returnOrder.status = "received";
    returnOrder.updatedBy = getUserId(req);
    await returnOrder.save({ session });

    await createAuditLog({
      organizationId,
      userId: getUserId(req),
      action: "RETURN_RECEIVED",
      entityId: returnOrder._id,
      metadata: { orderId: returnOrder.orderId },
      req,
    });

    await session.commitTransaction();
    return res.status(200).json(new ApiResponse(200, "Return received", returnOrder));
  } catch (error) {
    if (transactionStarted) await session.abortTransaction();
    logger.error("Error in receiveReturn:", error);
    return next(new ApiError(error.statusCode || 500, error.message || "Internal Server Error"));
  } finally {
    session.endSession();
  }
});

