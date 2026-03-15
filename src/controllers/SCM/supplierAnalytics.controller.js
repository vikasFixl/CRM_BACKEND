import logger from "../../../config/logger.js";
import { SupplierAnalytics } from "../../models/SCM/SupplierAnalytics.js";
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
    entityType: "SupplierAnalytics",
    entityId,
    metadata,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
  });
};

const clampScore = (val) => Math.max(0, Math.min(100, val));

export const runSupplierAnalytics = asyncHandler(async (req, res, next) => {
  try {
    const organizationId = getOrgId(req);
    if (!organizationId) return next(new ApiError(401, "Organization context missing"));

    const period = "30days";
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const purchaseOrders = await PurchaseOrder.find({
      organizationId,
      orderDate: { $gte: startDate },
    }).lean();

    const vendorMap = new Map();
    for (const po of purchaseOrders) {
      const key = String(po.vendorId);
      if (!vendorMap.has(key)) {
        vendorMap.set(key, {
          vendorId: po.vendorId,
          totalOrders: 0,
          onTimeDeliveries: 0,
          lateDeliveries: 0,
          leadTimeTotal: 0,
          leadTimeCount: 0,
          orderedQty: 0,
          receivedQty: 0,
        });
      }
      const bucket = vendorMap.get(key);
      bucket.totalOrders += 1;

      if (po.status === "received" && po.orderDate) {
        const receivedAt = po.updatedAt || po.orderDate;
        const leadDays = Math.max(
          0,
          Math.ceil((new Date(receivedAt) - new Date(po.orderDate)) / (1000 * 60 * 60 * 24))
        );
        bucket.leadTimeTotal += leadDays;
        bucket.leadTimeCount += 1;

        if (po.expectedDeliveryDate) {
          const onTime = new Date(receivedAt) <= new Date(po.expectedDeliveryDate);
          if (onTime) bucket.onTimeDeliveries += 1;
          else bucket.lateDeliveries += 1;
        }
      }

      for (const item of po.items || []) {
        bucket.orderedQty += Number(item.quantity || 0);
        bucket.receivedQty += Number(item.receivedQuantity || 0);
      }
    }

    const results = [];
    for (const [, v] of vendorMap) {
      const totalOrders = v.totalOrders;
      const onTimeRate = totalOrders ? v.onTimeDeliveries / totalOrders : 0;
      const fulfillmentRate = v.orderedQty ? v.receivedQty / v.orderedQty : 0;
      const avgLeadTime = v.leadTimeCount ? v.leadTimeTotal / v.leadTimeCount : 0;
      const leadTimeScore = avgLeadTime ? Math.max(0, 1 - avgLeadTime / 30) : 1;
      const defectRate = 0;

      const rawScore = onTimeRate * 40 + fulfillmentRate * 40 + leadTimeScore * 20 - defectRate * 20;
      const performanceScore = clampScore(rawScore);

      const analytics = await SupplierAnalytics.findOneAndUpdate(
        { organizationId, vendorId: v.vendorId, period },
        {
          organizationId,
          vendorId: v.vendorId,
          period,
          totalOrders: v.totalOrders,
          onTimeDeliveries: v.onTimeDeliveries,
          lateDeliveries: v.lateDeliveries,
          averageLeadTime: avgLeadTime,
          defectRate,
          fulfillmentRate,
          performanceScore,
          generatedAt: new Date(),
          updatedBy: getUserId(req),
        },
        { upsert: true, new: true }
      );

      results.push(analytics);

      await createAuditLog({
        organizationId,
        userId: getUserId(req),
        action: "SUPPLIER_ANALYTICS_GENERATED",
        entityId: analytics._id,
        metadata: { vendorId: v.vendorId, performanceScore },
        req,
      });
    }

    return res.status(200).json(
      new ApiResponse(200, "Supplier analytics generated", { analytics: results })
    );
  } catch (error) {
    logger.error("Error in runSupplierAnalytics:", error);
    return next(new ApiError(error.statusCode || 500, error.message || "Internal Server Error"));
  }
});

export const getSupplierAnalytics = asyncHandler(async (req, res, next) => {
  try {
    const organizationId = getOrgId(req);
    if (!organizationId) return next(new ApiError(401, "Organization context missing"));

    const { page = 1, limit = 20, period } = req.query;
    const query = { organizationId };
    if (period) query.period = period;

    const [analytics, total] = await Promise.all([
      SupplierAnalytics.find(query)
        .sort({ generatedAt: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit))
        .lean(),
      SupplierAnalytics.countDocuments(query),
    ]);

    return res.status(200).json(
      new ApiResponse(200, "Supplier analytics fetched", {
        analytics,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      })
    );
  } catch (error) {
    logger.error("Error in getSupplierAnalytics:", error);
    return next(new ApiError(error.statusCode || 500, error.message || "Internal Server Error"));
  }
});

export const getSupplierAnalyticsByVendor = asyncHandler(async (req, res, next) => {
  try {
    const organizationId = getOrgId(req);
    if (!organizationId) return next(new ApiError(401, "Organization context missing"));

    const { vendorId } = req.params;
    const analytics = await SupplierAnalytics.findOne({ organizationId, vendorId }).lean();
    if (!analytics) return next(new ApiError(404, "Supplier analytics not found"));

    return res.status(200).json(new ApiResponse(200, "Supplier analytics fetched", analytics));
  } catch (error) {
    logger.error("Error in getSupplierAnalyticsByVendor:", error);
    return next(new ApiError(error.statusCode || 500, error.message || "Internal Server Error"));
  }
});

