import mongoose from "mongoose";
import logger from "../../../config/logger.js";
import { WarehouseLocation } from "../../models/SCM/WarehouseLocation.js";
import { asyncHandler } from "../../middleweare/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

const getOrgId = (req) => req.orgUser?.orgId;
const getUserId = (req) => req.orgUser?.userId || req.user?.userId || null;

const buildLocationCode = ({ zone, rack, bin }) =>
  [zone, rack, bin].filter(Boolean).join("-");

export const getWarehouseLocations = asyncHandler(async (req, res, next) => {
  try {
    const organizationId = getOrgId(req);
    if (!organizationId) return next(new ApiError(401, "Organization context missing"));

    const { warehouseId, page = 1, limit = 50 } = req.query;
    const query = { organizationId };
    if (warehouseId) query.warehouseId = warehouseId;

    const [locations, total] = await Promise.all([
      WarehouseLocation.find(query)
        .sort({ createdAt: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit))
        .lean(),
      WarehouseLocation.countDocuments(query),
    ]);

    return res.status(200).json(
      new ApiResponse(200, "Warehouse locations fetched", {
        locations,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      })
    );
  } catch (error) {
    logger.error("Error in getWarehouseLocations:", error);
    return next(new ApiError(error.statusCode || 500, error.message || "Internal Server Error"));
  }
});

export const createWarehouseLocation = asyncHandler(async (req, res, next) => {
  try {
    const organizationId = getOrgId(req);
    if (!organizationId) return next(new ApiError(401, "Organization context missing"));

    const { warehouseId, zone, rack, bin, capacity, locationCode, description } = req.body;
    if (!warehouseId) return next(new ApiError(400, "warehouseId is required"));

    const code = locationCode || buildLocationCode({ zone, rack, bin });
    if (!code) return next(new ApiError(400, "locationCode or zone/rack/bin required"));

    const location = await WarehouseLocation.create({
      organizationId,
      warehouseId,
      zone,
      rack,
      bin,
      capacity,
      locationCode: code,
      description,
      createdBy: getUserId(req),
      updatedBy: getUserId(req),
    });

    return res
      .status(201)
      .json(new ApiResponse(201, "Warehouse location created", location));
  } catch (error) {
    logger.error("Error in createWarehouseLocation:", error);
    return next(new ApiError(error.statusCode || 500, error.message || "Internal Server Error"));
  }
});

export const updateWarehouseLocation = asyncHandler(async (req, res, next) => {
  try {
    const organizationId = getOrgId(req);
    if (!organizationId) return next(new ApiError(401, "Organization context missing"));

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ApiError(400, "Invalid warehouse location id"));
    }

    const update = { ...req.body, updatedBy: getUserId(req) };
    if (!update.locationCode && (update.zone || update.rack || update.bin)) {
      update.locationCode = buildLocationCode(update);
    }

    const location = await WarehouseLocation.findOneAndUpdate(
      { _id: id, organizationId },
      update,
      { new: true }
    );
    if (!location) return next(new ApiError(404, "Warehouse location not found"));

    return res
      .status(200)
      .json(new ApiResponse(200, "Warehouse location updated", location));
  } catch (error) {
    logger.error("Error in updateWarehouseLocation:", error);
    return next(new ApiError(error.statusCode || 500, error.message || "Internal Server Error"));
  }
});

