import mongoose from "mongoose";
import logger from "../../../config/logger.js";
import { Order } from "../../models/SCM/Order.js";
import { Inventory } from "../../models/SCM/Inventory.js";
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
    entityType: "Order",
    entityId,
    metadata,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
  });
};

export const createOrder = asyncHandler(async (req, res, next) => {
  try {
    const organizationId = getOrgId(req);
    if (!organizationId) return next(new ApiError(401, "Organization context missing"));

    const { orderNumber, items, warehouseId, customerId, notes, currency } = req.body;
    if (!orderNumber) return next(new ApiError(400, "orderNumber is required"));
    if (!Array.isArray(items) || items.length === 0) {
      return next(new ApiError(400, "items must be a non-empty array"));
    }
    if (!warehouseId) return next(new ApiError(400, "warehouseId is required"));

    const order = await Order.create({
      organizationId,
      orderNumber,
      items,
      warehouseId,
      customerId,
      notes,
      currency,
      status: "created",
      createdBy: getUserId(req),
      updatedBy: getUserId(req),
    });

    await createAuditLog({
      organizationId,
      userId: getUserId(req),
      action: "ORDER_CREATED",
      entityId: order._id,
      metadata: { orderNumber: order.orderNumber },
      req,
    });

    return res.status(201).json(new ApiResponse(201, "Order created", order));
  } catch (error) {
    logger.error("Error in createOrder:", error);
    return next(new ApiError(error.statusCode || 500, error.message || "Internal Server Error"));
  }
});

export const getOrders = asyncHandler(async (req, res, next) => {
  try {
    const organizationId = getOrgId(req);
    if (!organizationId) return next(new ApiError(401, "Organization context missing"));

    const { page = 1, limit = 20, status, orderNumber, customerId } = req.query;
    const query = { organizationId };
    if (status) query.status = status;
    if (orderNumber) query.orderNumber = orderNumber;
    if (customerId) query.customerId = customerId;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit))
        .lean(),
      Order.countDocuments(query),
    ]);

    return res.status(200).json(
      new ApiResponse(200, "Orders fetched", {
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
    logger.error("Error in getOrders:", error);
    return next(new ApiError(error.statusCode || 500, error.message || "Internal Server Error"));
  }
});

export const getOrderById = asyncHandler(async (req, res, next) => {
  try {
    const organizationId = getOrgId(req);
    if (!organizationId) return next(new ApiError(401, "Organization context missing"));

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ApiError(400, "Invalid order id"));
    }

    const order = await Order.findOne({ _id: id, organizationId }).lean();
    if (!order) return next(new ApiError(404, "Order not found"));

    return res.status(200).json(new ApiResponse(200, "Order fetched", order));
  } catch (error) {
    logger.error("Error in getOrderById:", error);
    return next(new ApiError(error.statusCode || 500, error.message || "Internal Server Error"));
  }
});

export const confirmOrder = asyncHandler(async (req, res, next) => {
  const session = await mongoose.startSession();
  let transactionStarted = false;
  try {
    const organizationId = getOrgId(req);
    if (!organizationId) throw new ApiError(401, "Organization context missing");

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid order id");
    }

    session.startTransaction();
    transactionStarted = true;

    const order = await Order.findOne({ _id: id, organizationId }).session(session);
    if (!order) throw new ApiError(404, "Order not found");
    if (order.status !== "created") {
      throw new ApiError(400, "Only created orders can be confirmed");
    }

    const warehouseId = order.warehouseId;
    if (!warehouseId) throw new ApiError(400, "warehouseId is required to confirm order");

    for (const item of order.items) {
      const inv = await Inventory.findOne({
        organizationId,
        skuId: item.skuId,
        warehouseId,
      }).session(session);

      if (!inv) {
        throw new ApiError(400, `Insufficient inventory for sku ${item.skuId}`);
      }

      const availableToReserve = inv.quantityAvailable - inv.quantityReserved;
      if (availableToReserve < item.quantity) {
        throw new ApiError(400, `Insufficient inventory for sku ${item.skuId}`);
      }
    }

    for (const item of order.items) {
      await Inventory.findOneAndUpdate(
        { organizationId, skuId: item.skuId, warehouseId },
        { $inc: { quantityReserved: item.quantity } },
        { session }
      );
    }

    order.status = "confirmed";
    order.updatedBy = getUserId(req);
    await order.save({ session });

    await createAuditLog({
      organizationId,
      userId: getUserId(req),
      action: "ORDER_CONFIRMED",
      entityId: order._id,
      metadata: { orderNumber: order.orderNumber },
      req,
    });

    await session.commitTransaction();
    return res.status(200).json(new ApiResponse(200, "Order confirmed", order));
  } catch (error) {
    if (transactionStarted) await session.abortTransaction();
    logger.error("Error in confirmOrder:", error);
    return next(new ApiError(error.statusCode || 500, error.message || "Internal Server Error"));
  } finally {
    session.endSession();
  }
});

export const pickOrder = asyncHandler(async (req, res, next) => {
  try {
    const organizationId = getOrgId(req);
    if (!organizationId) return next(new ApiError(401, "Organization context missing"));

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ApiError(400, "Invalid order id"));
    }

    const order = await Order.findOne({ _id: id, organizationId });
    if (!order) return next(new ApiError(404, "Order not found"));
    if (order.status !== "confirmed") {
      return next(new ApiError(400, "Only confirmed orders can be picked"));
    }

    order.status = "picking";
    order.updatedBy = getUserId(req);
    await order.save();

    await createAuditLog({
      organizationId,
      userId: getUserId(req),
      action: "ORDER_PICKED",
      entityId: order._id,
      metadata: { orderNumber: order.orderNumber },
      req,
    });

    return res.status(200).json(new ApiResponse(200, "Order moved to picking", order));
  } catch (error) {
    logger.error("Error in pickOrder:", error);
    return next(new ApiError(error.statusCode || 500, error.message || "Internal Server Error"));
  }
});

export const packOrder = asyncHandler(async (req, res, next) => {
  try {
    const organizationId = getOrgId(req);
    if (!organizationId) return next(new ApiError(401, "Organization context missing"));

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ApiError(400, "Invalid order id"));
    }

    const order = await Order.findOne({ _id: id, organizationId });
    if (!order) return next(new ApiError(404, "Order not found"));
    if (order.status !== "picking") {
      return next(new ApiError(400, "Only picking orders can be packed"));
    }

    order.status = "packed";
    order.updatedBy = getUserId(req);
    await order.save();

    await createAuditLog({
      organizationId,
      userId: getUserId(req),
      action: "ORDER_PACKED",
      entityId: order._id,
      metadata: { orderNumber: order.orderNumber },
      req,
    });

    return res.status(200).json(new ApiResponse(200, "Order packed", order));
  } catch (error) {
    logger.error("Error in packOrder:", error);
    return next(new ApiError(error.statusCode || 500, error.message || "Internal Server Error"));
  }
});

export const cancelOrder = asyncHandler(async (req, res, next) => {
  const session = await mongoose.startSession();
  let transactionStarted = false;
  try {
    const organizationId = getOrgId(req);
    if (!organizationId) throw new ApiError(401, "Organization context missing");

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid order id");
    }

    session.startTransaction();
    transactionStarted = true;

    const order = await Order.findOne({ _id: id, organizationId }).session(session);
    if (!order) throw new ApiError(404, "Order not found");
    if (!["created", "confirmed"].includes(order.status)) {
      throw new ApiError(400, "Only created or confirmed orders can be cancelled");
    }

    if (order.status === "confirmed") {
      const warehouseId = order.warehouseId;
      for (const item of order.items) {
        await Inventory.findOneAndUpdate(
          { organizationId, skuId: item.skuId, warehouseId },
          { $inc: { quantityReserved: -item.quantity } },
          { session }
        );
      }
    }

    order.status = "cancelled";
    order.updatedBy = getUserId(req);
    await order.save({ session });

    await createAuditLog({
      organizationId,
      userId: getUserId(req),
      action: "ORDER_CANCELLED",
      entityId: order._id,
      metadata: { orderNumber: order.orderNumber },
      req,
    });

    await session.commitTransaction();
    return res.status(200).json(new ApiResponse(200, "Order cancelled", order));
  } catch (error) {
    if (transactionStarted) await session.abortTransaction();
    logger.error("Error in cancelOrder:", error);
    return next(new ApiError(error.statusCode || 500, error.message || "Internal Server Error"));
  } finally {
    session.endSession();
  }
});

