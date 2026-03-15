import mongoose from "mongoose";
import logger from "../../../config/logger.js";
import { EDITransaction } from "../../models/SCM/EDITransaction.js";
import { PurchaseOrder } from "../../models/SCM/PurchaseOrder.js";
import { Shipment } from "../../models/SCM/Shipment.js";
import { AuditLog } from "../../models/SCM/AuditLog.js";
import { asyncHandler } from "../../middleweare/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import {
  mapPurchaseOrderTo850,
  mapShipmentTo856,
  mapInboundDocument,
} from "../../service/SCM/ediMapper.service.js";
import {
  createOutboundEdiTransaction,
  createInboundEdiTransaction,
} from "../../service/SCM/edi.service.js";

const getOrgId = (req) => req.orgUser?.orgId;
const getUserId = (req) => req.orgUser?.userId || req.user?.userId || null;

export const sendEdi = asyncHandler(async (req, res, next) => {
  try {
    const organizationId = getOrgId(req);
    if (!organizationId) return next(new ApiError(401, "Organization context missing"));

    const { documentType, referenceId, referenceType } = req.body;
    if (!documentType || !referenceId || !referenceType) {
      return next(new ApiError(400, "documentType, referenceId, referenceType are required"));
    }

    let payload = req.body.payload || null;
    if (!payload) {
      if (documentType === "850" && referenceType === "PurchaseOrder") {
        const po = await PurchaseOrder.findOne({ _id: referenceId, organizationId }).lean();
        if (!po) return next(new ApiError(404, "Purchase order not found"));
        payload = mapPurchaseOrderTo850(po);
      }
      if (documentType === "856" && referenceType === "Shipment") {
        const shipment = await Shipment.findOne({ _id: referenceId, organizationId }).lean();
        if (!shipment) return next(new ApiError(404, "Shipment not found"));
        payload = mapShipmentTo856(shipment);
      }
    }

    const edi = await createOutboundEdiTransaction({
      organizationId,
      documentType,
      referenceId,
      referenceType,
      payload,
    });

    await AuditLog.create({
      organizationId,
      userId: getUserId(req),
      action: "EDI_DOCUMENT_SENT",
      entityType: "EDITransaction",
      entityId: edi._id,
      metadata: { documentType, referenceType, referenceId },
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    return res.status(201).json(new ApiResponse(201, "EDI document sent", edi));
  } catch (error) {
    logger.error("Error in sendEdi:", error);
    return next(new ApiError(error.statusCode || 500, error.message || "Internal Server Error"));
  }
});

export const receiveEdi = asyncHandler(async (req, res, next) => {
  try {
    const organizationId = getOrgId(req);
    if (!organizationId) return next(new ApiError(401, "Organization context missing"));

    const { documentType, referenceId, referenceType, payload } = req.body;
    if (!documentType || !payload) {
      return next(new ApiError(400, "documentType and payload are required"));
    }

    const mapped = mapInboundDocument(documentType, payload);
    const edi = await createInboundEdiTransaction({
      organizationId,
      documentType,
      referenceId,
      referenceType,
      payload: mapped,
    });

    await AuditLog.create({
      organizationId,
      userId: getUserId(req),
      action: "EDI_DOCUMENT_RECEIVED",
      entityType: "EDITransaction",
      entityId: edi._id,
      metadata: { documentType, referenceType, referenceId },
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    return res.status(201).json(new ApiResponse(201, "EDI document received", edi));
  } catch (error) {
    logger.error("Error in receiveEdi:", error);
    return next(new ApiError(error.statusCode || 500, error.message || "Internal Server Error"));
  }
});

export const getEdiTransactions = asyncHandler(async (req, res, next) => {
  try {
    const organizationId = getOrgId(req);
    if (!organizationId) return next(new ApiError(401, "Organization context missing"));

    const { page = 1, limit = 20, documentType, direction } = req.query;
    const query = { organizationId };
    if (documentType) query.documentType = documentType;
    if (direction) query.direction = direction;

    const [items, total] = await Promise.all([
      EDITransaction.find(query)
        .sort({ createdAt: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit))
        .lean(),
      EDITransaction.countDocuments(query),
    ]);

    return res.status(200).json(
      new ApiResponse(200, "EDI transactions fetched", {
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
    logger.error("Error in getEdiTransactions:", error);
    return next(new ApiError(error.statusCode || 500, error.message || "Internal Server Error"));
  }
});

export const getEdiById = asyncHandler(async (req, res, next) => {
  try {
    const organizationId = getOrgId(req);
    if (!organizationId) return next(new ApiError(401, "Organization context missing"));

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ApiError(400, "Invalid EDI id"));
    }

    const edi = await EDITransaction.findOne({ _id: id, organizationId }).lean();
    if (!edi) return next(new ApiError(404, "EDI transaction not found"));

    return res.status(200).json(new ApiResponse(200, "EDI transaction fetched", edi));
  } catch (error) {
    logger.error("Error in getEdiById:", error);
    return next(new ApiError(error.statusCode || 500, error.message || "Internal Server Error"));
  }
});

