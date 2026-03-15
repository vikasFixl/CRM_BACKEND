import mongoose from "mongoose";
import logger from "../../../config/logger.js";
import { Vendor } from "../../models/SCM/Vendor.js";
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
    entityType: "Vendor",
    entityId,
    metadata,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
  });
};

export const createVendor = asyncHandler(async (req, res, next) => {
  try {
    const organizationId = getOrgId(req);
    if (!organizationId) return next(new ApiError(401, "Organization context missing"));

    const { name, vendorCode, email, phone, taxId, address, isActive } = req.body;
    if (!name) return next(new ApiError(400, "Vendor name is required"));

    const vendor = await Vendor.create({
      organizationId,
      name,
      vendorCode,
      email,
      phone,
      taxId,
      address,
      isActive,
      createdBy: getUserId(req),
      updatedBy: getUserId(req),
    });

    await createAuditLog({
      organizationId,
      userId: getUserId(req),
      action: "SCM_VENDOR_CREATED",
      entityId: vendor._id,
      metadata: { name: vendor.name, vendorCode: vendor.vendorCode },
      req,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, "Vendor created successfully", vendor));
  } catch (error) {
    logger.error("Error in createVendor:", error);
    return next(new ApiError(error.statusCode || 500, error.message || "Internal Server Error"));
  }
});

export const getVendors = asyncHandler(async (req, res, next) => {
  try {
    const organizationId = getOrgId(req);
    if (!organizationId) return next(new ApiError(401, "Organization context missing"));

    const { page = 1, limit = 20, isActive } = req.query;
    const query = { organizationId };
    if (isActive === "true") query.isActive = true;
    if (isActive === "false") query.isActive = false;

    const [vendors, total] = await Promise.all([
      Vendor.find(query)
        .sort({ createdAt: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit))
        .lean(),
      Vendor.countDocuments(query),
    ]);

    return res.status(200).json(
      new ApiResponse(200, "Vendors fetched successfully", {
        vendors,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      })
    );
  } catch (error) {
    logger.error("Error in getVendors:", error);
    return next(new ApiError(error.statusCode || 500, error.message || "Internal Server Error"));
  }
});

export const getVendorById = asyncHandler(async (req, res, next) => {
  try {
    const organizationId = getOrgId(req);
    if (!organizationId) return next(new ApiError(401, "Organization context missing"));

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ApiError(400, "Invalid vendor id"));
    }

    const vendor = await Vendor.findOne({ _id: id, organizationId }).lean();
    if (!vendor) return next(new ApiError(404, "Vendor not found"));

    return res.status(200).json(new ApiResponse(200, "Vendor fetched successfully", vendor));
  } catch (error) {
    logger.error("Error in getVendorById:", error);
    return next(new ApiError(error.statusCode || 500, error.message || "Internal Server Error"));
  }
});

export const updateVendor = asyncHandler(async (req, res, next) => {
  try {
    const organizationId = getOrgId(req);
    if (!organizationId) return next(new ApiError(401, "Organization context missing"));

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ApiError(400, "Invalid vendor id"));
    }

    const update = { ...req.body, updatedBy: getUserId(req) };
    const vendor = await Vendor.findOneAndUpdate(
      { _id: id, organizationId },
      update,
      { new: true }
    );
    if (!vendor) return next(new ApiError(404, "Vendor not found"));

    await createAuditLog({
      organizationId,
      userId: getUserId(req),
      action: "SCM_VENDOR_UPDATED",
      entityId: vendor._id,
      metadata: { changes: Object.keys(req.body || {}) },
      req,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, "Vendor updated successfully", vendor));
  } catch (error) {
    logger.error("Error in updateVendor:", error);
    return next(new ApiError(error.statusCode || 500, error.message || "Internal Server Error"));
  }
});

export const deleteVendor = asyncHandler(async (req, res, next) => {
  try {
    const organizationId = getOrgId(req);
    if (!organizationId) return next(new ApiError(401, "Organization context missing"));

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ApiError(400, "Invalid vendor id"));
    }

    const vendor = await Vendor.findOneAndDelete({ _id: id, organizationId });
    if (!vendor) return next(new ApiError(404, "Vendor not found"));

    await createAuditLog({
      organizationId,
      userId: getUserId(req),
      action: "SCM_VENDOR_DELETED",
      entityId: vendor._id,
      metadata: { name: vendor.name, vendorCode: vendor.vendorCode },
      req,
    });

    return res.status(200).json(new ApiResponse(200, "Vendor deleted successfully"));
  } catch (error) {
    logger.error("Error in deleteVendor:", error);
    return next(new ApiError(error.statusCode || 500, error.message || "Internal Server Error"));
  }
});

