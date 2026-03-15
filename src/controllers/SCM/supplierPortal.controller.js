import mongoose from "mongoose";
import logger from "../../../config/logger.js";
import { PurchaseOrder } from "../../models/SCM/PurchaseOrder.js";
import { Shipment } from "../../models/SCM/Shipment.js";
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
    entityType: "SupplierPortal",
    entityId,
    metadata,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
  });
};

export const getSupplierOrders = asyncHandler(async (req, res, next) => {
  try {
    const organizationId = getOrgId(req);
    if (!organizationId) return next(new ApiError(401, "Organization context missing"));

    const { vendorId, page = 1, limit = 20, status } = req.query;
    if (!vendorId) return next(new ApiError(400, "vendorId is required"));

    const query = { organizationId, vendorId };
    if (status) query.status = status;

    const [orders, total] = await Promise.all([
      PurchaseOrder.find(query)
        .sort({ createdAt: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit))
        .lean(),
      PurchaseOrder.countDocuments(query),
    ]);

    return res.status(200).json(
      new ApiResponse(200, "Supplier orders fetched", {
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
    logger.error("Error in getSupplierOrders:", error);
    return next(new ApiError(error.statusCode || 500, error.message || "Internal Server Error"));
  }
});

export const confirmSupplierOrder = asyncHandler(async (req, res, next) => {
  try {
    const organizationId = getOrgId(req);
    if (!organizationId) return next(new ApiError(401, "Organization context missing"));

    const { id } = req.params;
    const { vendorId } = req.body;
    if (!vendorId) return next(new ApiError(400, "vendorId is required"));
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ApiError(400, "Invalid purchase order id"));
    }

    const po = await PurchaseOrder.findOne({ _id: id, organizationId, vendorId });
    if (!po) return next(new ApiError(404, "Purchase order not found"));

    if (po.status === "received" || po.status === "cancelled") {
      return next(new ApiError(400, "Order cannot be confirmed in current status"));
    }

    if (po.status === "draft") {
      po.status = "approved";
    }
    po.updatedBy = getUserId(req);
    await po.save();

    await createAuditLog({
      organizationId,
      userId: getUserId(req),
      action: "SUPPLIER_PORTAL_ORDER_CONFIRMED",
      entityId: po._id,
      metadata: { vendorId },
      req,
    });

    return res.status(200).json(new ApiResponse(200, "Purchase order confirmed", po));
  } catch (error) {
    logger.error("Error in confirmSupplierOrder:", error);
    return next(new ApiError(error.statusCode || 500, error.message || "Internal Server Error"));
  }
});

export const createSupplierShipment = asyncHandler(async (req, res, next) => {
  try {
    const organizationId = getOrgId(req);
    if (!organizationId) return next(new ApiError(401, "Organization context missing"));

    const { orderId, vendorId, carrier, trackingNumber, warehouseId } = req.body;
    if (!orderId || !vendorId || !warehouseId) {
      return next(new ApiError(400, "orderId, vendorId, warehouseId are required"));
    }

    const po = await PurchaseOrder.findOne({ _id: orderId, organizationId, vendorId });
    if (!po) return next(new ApiError(404, "Purchase order not found"));

    const shipment = await Shipment.create({
      organizationId,
      orderId: po._id,
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
      action: "SUPPLIER_PORTAL_SHIPMENT_CREATED",
      entityId: shipment._id,
      metadata: { orderId: po._id, vendorId },
      req,
    });

    return res.status(201).json(new ApiResponse(201, "Supplier shipment created", shipment));
  } catch (error) {
    logger.error("Error in createSupplierShipment:", error);
    return next(new ApiError(error.statusCode || 500, error.message || "Internal Server Error"));
  }
});

