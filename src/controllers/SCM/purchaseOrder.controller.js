import mongoose from "mongoose";
import logger from "../../../config/logger.js";
import { PurchaseOrder } from "../../models/SCM/PurchaseOrder.js";
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
    entityType: "PurchaseOrder",
    entityId,
    metadata,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
  });
};

export const createPurchaseOrder = asyncHandler(async (req, res, next) => {
  try {
    const organizationId = getOrgId(req);
    if (!organizationId) return next(new ApiError(401, "Organization context missing"));

    const { vendorId, orderNumber, items, warehouseId, expectedDeliveryDate, notes, currency } =
      req.body;

    if (!vendorId || !orderNumber) {
      return next(new ApiError(400, "vendorId and orderNumber are required"));
    }
    if (!Array.isArray(items) || items.length === 0) {
      return next(new ApiError(400, "items must be a non-empty array"));
    }

    const purchaseOrder = await PurchaseOrder.create({
      organizationId,
      vendorId,
      warehouseId,
      orderNumber,
      status: "draft",
      expectedDeliveryDate,
      items,
      notes,
      currency,
      createdBy: getUserId(req),
      updatedBy: getUserId(req),
    });

    await createAuditLog({
      organizationId,
      userId: getUserId(req),
      action: "SCM_PO_CREATED",
      entityId: purchaseOrder._id,
      metadata: { orderNumber: purchaseOrder.orderNumber },
      req,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, "Purchase order created", purchaseOrder));
  } catch (error) {
    logger.error("Error in createPurchaseOrder:", error);
    return next(new ApiError(error.statusCode || 500, error.message || "Internal Server Error"));
  }
});

export const getPurchaseOrders = asyncHandler(async (req, res, next) => {
  try {
    const organizationId = getOrgId(req);
    if (!organizationId) return next(new ApiError(401, "Organization context missing"));

    const { page = 1, limit = 20, status, vendorId, orderNumber } = req.query;
    const query = { organizationId };
    if (status) query.status = status;
    if (vendorId) query.vendorId = vendorId;
    if (orderNumber) query.orderNumber = orderNumber;

    const [orders, total] = await Promise.all([
      PurchaseOrder.find(query)
        .sort({ createdAt: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit))
        .lean(),
      PurchaseOrder.countDocuments(query),
    ]);

    return res.status(200).json(
      new ApiResponse(200, "Purchase orders fetched", {
        orders,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      })
    );
  } catch (error) {
    logger.error("Error in getPurchaseOrders:", error);
    return next(new ApiError(error.statusCode || 500, error.message || "Internal Server Error"));
  }
});

export const getPurchaseOrderById = asyncHandler(async (req, res, next) => {
  try {
    const organizationId = getOrgId(req);
    if (!organizationId) return next(new ApiError(401, "Organization context missing"));

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ApiError(400, "Invalid purchase order id"));
    }

    const order = await PurchaseOrder.findOne({ _id: id, organizationId }).lean();
    if (!order) return next(new ApiError(404, "Purchase order not found"));

    return res.status(200).json(new ApiResponse(200, "Purchase order fetched", order));
  } catch (error) {
    logger.error("Error in getPurchaseOrderById:", error);
    return next(new ApiError(error.statusCode || 500, error.message || "Internal Server Error"));
  }
});

export const updatePurchaseOrder = asyncHandler(async (req, res, next) => {
  try {
    const organizationId = getOrgId(req);
    if (!organizationId) return next(new ApiError(401, "Organization context missing"));

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ApiError(400, "Invalid purchase order id"));
    }

    const existing = await PurchaseOrder.findOne({ _id: id, organizationId });
    if (!existing) return next(new ApiError(404, "Purchase order not found"));
    if (existing.status !== "draft") {
      return next(new ApiError(400, "Only draft orders can be updated"));
    }

    Object.assign(existing, req.body, { updatedBy: getUserId(req) });
    await existing.save();

    await createAuditLog({
      organizationId,
      userId: getUserId(req),
      action: "SCM_PO_UPDATED",
      entityId: existing._id,
      metadata: { changes: Object.keys(req.body || {}) },
      req,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, "Purchase order updated", existing));
  } catch (error) {
    logger.error("Error in updatePurchaseOrder:", error);
    return next(new ApiError(error.statusCode || 500, error.message || "Internal Server Error"));
  }
});

export const approvePurchaseOrder = asyncHandler(async (req, res, next) => {
  try {
    const organizationId = getOrgId(req);
    if (!organizationId) return next(new ApiError(401, "Organization context missing"));

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ApiError(400, "Invalid purchase order id"));
    }

    const order = await PurchaseOrder.findOne({ _id: id, organizationId });
    if (!order) return next(new ApiError(404, "Purchase order not found"));
    if (order.status !== "draft") {
      return next(new ApiError(400, "Only draft orders can be approved"));
    }

    order.status = "approved";
    order.updatedBy = getUserId(req);
    await order.save();

    await createAuditLog({
      organizationId,
      userId: getUserId(req),
      action: "SCM_PO_APPROVED",
      entityId: order._id,
      metadata: { orderNumber: order.orderNumber },
      req,
    });

    return res.status(200).json(new ApiResponse(200, "Purchase order approved", order));
  } catch (error) {
    logger.error("Error in approvePurchaseOrder:", error);
    return next(new ApiError(error.statusCode || 500, error.message || "Internal Server Error"));
  }
});

export const receivePurchaseOrder = asyncHandler(async (req, res, next) => {
  const session = await mongoose.startSession();
  let transactionStarted = false;
  try {
    const organizationId = getOrgId(req);
    if (!organizationId) throw new ApiError(401, "Organization context missing");

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid purchase order id");
    }

    session.startTransaction();
    transactionStarted = true;

    const order = await PurchaseOrder.findOne({ _id: id, organizationId }).session(session);
    if (!order) throw new ApiError(404, "Purchase order not found");
    if (order.status !== "approved") {
      throw new ApiError(400, "Only approved orders can be received");
    }

    const receiveItems = Array.isArray(req.body.items) ? req.body.items : [];
    const receiveMap = new Map(
      receiveItems.map((i) => [String(i.skuId), Number(i.receivedQuantity || 0)])
    );

    const warehouseId = order.warehouseId || req.body.warehouseId;
    if (!warehouseId) {
      throw new ApiError(400, "warehouseId is required to receive inventory");
    }

    for (const item of order.items) {
      const skuKey = String(item.skuId);
      const remaining = Math.max(0, item.quantity - item.receivedQuantity);
      const receiveQty = receiveMap.size
        ? Math.min(remaining, Number(receiveMap.get(skuKey) || 0))
        : remaining;

      if (receiveQty <= 0) continue;

      item.receivedQuantity += receiveQty;

      const existingInv = await Inventory.findOne({
        organizationId,
        skuId: item.skuId,
        warehouseId,
      }).session(session);

      if (existingInv) {
        existingInv.quantityAvailable += receiveQty;
        await existingInv.save({ session });
      } else {
        await Inventory.create(
          [
            {
              organizationId,
              skuId: item.skuId,
              warehouseId,
              quantityAvailable: receiveQty,
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
            movementType: "PURCHASE",
            quantity: receiveQty,
            referenceId: order._id,
            referenceType: "PurchaseOrder",
            createdBy: getUserId(req),
          },
        ],
        { session }
      );
    }

    order.status = "received";
    order.updatedBy = getUserId(req);
    await order.save({ session });

    await createAuditLog({
      organizationId,
      userId: getUserId(req),
      action: "SCM_PO_RECEIVED",
      entityId: order._id,
      metadata: { orderNumber: order.orderNumber },
      req,
    });

    await session.commitTransaction();
    return res.status(200).json(new ApiResponse(200, "Purchase order received", order));
  } catch (error) {
    if (transactionStarted) await session.abortTransaction();
    logger.error("Error in receivePurchaseOrder:", error);
    return next(new ApiError(error.statusCode || 500, error.message || "Internal Server Error"));
  } finally {
    session.endSession();
  }
});
