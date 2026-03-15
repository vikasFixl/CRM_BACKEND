import mongoose from "mongoose";
import logger from "../../../config/logger.js";
import { Shipment } from "../../models/SCM/Shipment.js";
import { Order } from "../../models/SCM/Order.js";
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
    entityType: "Shipment",
    entityId,
    metadata,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
  });
};

export const createShipment = asyncHandler(async (req, res, next) => {
  try {
    const organizationId = getOrgId(req);
    if (!organizationId) return next(new ApiError(401, "Organization context missing"));

    const { orderId, carrier, trackingNumber, warehouseId } = req.body;
    if (!orderId || !warehouseId) {
      return next(new ApiError(400, "orderId and warehouseId are required"));
    }

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return next(new ApiError(400, "Invalid order id"));
    }

    const order = await Order.findOne({ _id: orderId, organizationId }).lean();
    if (!order) return next(new ApiError(404, "Order not found"));

    const shipment = await Shipment.create({
      organizationId,
      orderId,
      warehouseId,
      carrier,
      trackingNumber,
      status: "pending",
      createdBy: getUserId(req),
      updatedBy: getUserId(req),
    });

    await createAuditLog({
      organizationId,
      userId: getUserId(req),
      action: "SHIPMENT_CREATED",
      entityId: shipment._id,
      metadata: { orderId, trackingNumber },
      req,
    });

    return res.status(201).json(new ApiResponse(201, "Shipment created", shipment));
  } catch (error) {
    logger.error("Error in createShipment:", error);
    return next(new ApiError(error.statusCode || 500, error.message || "Internal Server Error"));
  }
});

export const dispatchShipment = asyncHandler(async (req, res, next) => {
  const session = await mongoose.startSession();
  let transactionStarted = false;
  try {
    const organizationId = getOrgId(req);
    if (!organizationId) throw new ApiError(401, "Organization context missing");

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid shipment id");
    }

    session.startTransaction();
    transactionStarted = true;

    const shipment = await Shipment.findOne({ _id: id, organizationId }).session(session);
    if (!shipment) throw new ApiError(404, "Shipment not found");
    if (shipment.status === "shipped") {
      throw new ApiError(400, "Shipment already dispatched");
    }

    const order = await Order.findOne({ _id: shipment.orderId, organizationId }).session(session);
    if (!order) throw new ApiError(404, "Order not found for shipment");
    if (order.status !== "packed") {
      throw new ApiError(400, "Order must be packed before dispatch");
    }

    const warehouseId = shipment.warehouseId || order.warehouseId;
    if (!warehouseId) throw new ApiError(400, "warehouseId is required to dispatch shipment");

    for (const item of order.items) {
      const inv = await Inventory.findOne({
        organizationId,
        skuId: item.skuId,
        warehouseId,
      }).session(session);
      if (!inv) {
        throw new ApiError(400, `Insufficient inventory for sku ${item.skuId}`);
      }
      if (inv.quantityReserved < item.quantity || inv.quantityAvailable < item.quantity) {
        throw new ApiError(400, `Insufficient inventory for sku ${item.skuId}`);
      }
    }

    for (const item of order.items) {
      await Inventory.findOneAndUpdate(
        { organizationId, skuId: item.skuId, warehouseId },
        { $inc: { quantityAvailable: -item.quantity, quantityReserved: -item.quantity } },
        { session }
      );

      await InventoryMovement.create(
        [
          {
            organizationId,
            skuId: item.skuId,
            warehouseId,
            movementType: "SALE",
            quantity: item.quantity,
            referenceId: order._id,
            referenceType: "Order",
            createdBy: getUserId(req),
          },
        ],
        { session }
      );
    }

    order.status = "shipped";
    order.updatedBy = getUserId(req);
    await order.save({ session });

    shipment.status = "shipped";
    shipment.shippedAt = new Date();
    shipment.updatedBy = getUserId(req);
    await shipment.save({ session });

    await createAuditLog({
      organizationId,
      userId: getUserId(req),
      action: "SHIPMENT_DISPATCHED",
      entityId: shipment._id,
      metadata: { orderId: order._id, trackingNumber: shipment.trackingNumber },
      req,
    });

    await AuditLog.create(
      [
        {
          organizationId,
          userId: getUserId(req),
          action: "ORDER_SHIPPED",
          entityType: "Order",
          entityId: order._id,
          metadata: { orderNumber: order.orderNumber },
          ipAddress: req.ip,
          userAgent: req.headers["user-agent"],
        },
      ],
      { session }
    );

    await session.commitTransaction();
    return res.status(200).json(new ApiResponse(200, "Shipment dispatched", shipment));
  } catch (error) {
    if (transactionStarted) await session.abortTransaction();
    logger.error("Error in dispatchShipment:", error);
    return next(new ApiError(error.statusCode || 500, error.message || "Internal Server Error"));
  } finally {
    session.endSession();
  }
});

