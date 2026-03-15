import mongoose from "mongoose";
import logger from "../../../config/logger.js";
import { ShipmentTracking } from "../../models/SCM/ShipmentTracking.js";
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
    entityType: "ShipmentTracking",
    entityId,
    metadata,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
  });
};

const mapTrackingStatusToShipmentStatus = (status) => {
  if (status === "dispatched") return "shipped";
  if (status === "in_transit" || status === "out_for_delivery" || status === "delayed")
    return "in_transit";
  if (status === "delivered") return "delivered";
  if (status === "exception") return "cancelled";
  return null;
};

export const getTrackingByShipment = asyncHandler(async (req, res, next) => {
  try {
    const organizationId = getOrgId(req);
    if (!organizationId) return next(new ApiError(401, "Organization context missing"));

    const { shipmentId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(shipmentId)) {
      return next(new ApiError(400, "Invalid shipmentId"));
    }

    const tracking = await ShipmentTracking.find({
      organizationId,
      shipmentId,
    })
      .sort({ timestamp: -1 })
      .lean();

    return res.status(200).json(new ApiResponse(200, "Tracking fetched", tracking));
  } catch (error) {
    logger.error("Error in getTrackingByShipment:", error);
    return next(new ApiError(error.statusCode || 500, error.message || "Internal Server Error"));
  }
});

export const trackingWebhook = asyncHandler(async (req, res, next) => {
  try {
    const organizationId = getOrgId(req);
    if (!organizationId) return next(new ApiError(401, "Organization context missing"));

    const {
      shipmentId,
      trackingNumber,
      carrier,
      status,
      location,
      timestamp,
      metadata,
      documentType,
    } = req.body;

    if (!status) return next(new ApiError(400, "status is required"));
    if (!shipmentId && !trackingNumber) {
      return next(new ApiError(400, "shipmentId or trackingNumber is required"));
    }

    let shipment = null;
    if (shipmentId && mongoose.Types.ObjectId.isValid(shipmentId)) {
      shipment = await Shipment.findOne({ _id: shipmentId, organizationId });
    } else if (trackingNumber) {
      shipment = await Shipment.findOne({ trackingNumber, organizationId });
    }

    if (!shipment) return next(new ApiError(404, "Shipment not found"));

    const event = await ShipmentTracking.create({
      organizationId,
      shipmentId: shipment._id,
      carrier: carrier || shipment.carrier,
      trackingNumber: trackingNumber || shipment.trackingNumber,
      status,
      location,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      metadata: metadata || req.body,
    });

    const mappedStatus = mapTrackingStatusToShipmentStatus(status);
    if (mappedStatus) {
      shipment.status = mappedStatus;
      shipment.updatedBy = getUserId(req);
      await shipment.save();
    }

    await createAuditLog({
      organizationId,
      userId: getUserId(req),
      action: "SHIPMENT_TRACKED",
      entityId: event._id,
      metadata: { shipmentId: shipment._id, status },
      req,
    });

    if (documentType && ["855", "810"].includes(documentType)) {
      await AuditLog.create({
        organizationId,
        userId: getUserId(req),
        action: "EDI_DOCUMENT_RECEIVED",
        entityType: "EDITransaction",
        entityId: shipment._id,
        metadata: { documentType },
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      });
    }

    return res.status(200).json(new ApiResponse(200, "Tracking updated", event));
  } catch (error) {
    logger.error("Error in trackingWebhook:", error);
    return next(new ApiError(error.statusCode || 500, error.message || "Internal Server Error"));
  }
});

