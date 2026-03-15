import mongoose from "mongoose";
import logger from "../../../config/logger.js";
import { PickingList } from "../../models/SCM/PickingList.js";
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
    entityType: "PickingList",
    entityId,
    metadata,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
  });
};

export const createPickingList = asyncHandler(async (req, res, next) => {
  try {
    const organizationId = getOrgId(req);
    if (!organizationId) return next(new ApiError(401, "Organization context missing"));

    const { orderId, warehouseId, items } = req.body;
    if (!orderId || !warehouseId) {
      return next(new ApiError(400, "orderId and warehouseId are required"));
    }
    if (!Array.isArray(items) || items.length === 0) {
      return next(new ApiError(400, "items must be a non-empty array"));
    }

    const normalizedItems = items.map((item) => ({
      skuId: item.skuId,
      locationId: item.locationId,
      quantity: item.quantity,
      pickedQuantity: 0,
    }));

    const pickingList = await PickingList.create({
      organizationId,
      orderId,
      warehouseId,
      status: "pending",
      items: normalizedItems,
      createdBy: getUserId(req),
      updatedBy: getUserId(req),
    });

    await createAuditLog({
      organizationId,
      userId: getUserId(req),
      action: "PICKING_LIST_CREATED",
      entityId: pickingList._id,
      metadata: { orderId, warehouseId },
      req,
    });

    return res.status(201).json(new ApiResponse(201, "Picking list created", pickingList));
  } catch (error) {
    logger.error("Error in createPickingList:", error);
    return next(new ApiError(error.statusCode || 500, error.message || "Internal Server Error"));
  }
});

export const getPickingLists = asyncHandler(async (req, res, next) => {
  try {
    const organizationId = getOrgId(req);
    if (!organizationId) return next(new ApiError(401, "Organization context missing"));

    const { page = 1, limit = 20, status, orderId, warehouseId } = req.query;
    const query = { organizationId };
    if (status) query.status = status;
    if (orderId) query.orderId = orderId;
    if (warehouseId) query.warehouseId = warehouseId;

    const [lists, total] = await Promise.all([
      PickingList.find(query)
        .sort({ createdAt: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit))
        .lean(),
      PickingList.countDocuments(query),
    ]);

    return res.status(200).json(
      new ApiResponse(200, "Picking lists fetched", {
        lists,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      })
    );
  } catch (error) {
    logger.error("Error in getPickingLists:", error);
    return next(new ApiError(error.statusCode || 500, error.message || "Internal Server Error"));
  }
});

export const getPickingListById = asyncHandler(async (req, res, next) => {
  try {
    const organizationId = getOrgId(req);
    if (!organizationId) return next(new ApiError(401, "Organization context missing"));

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new ApiError(400, "Invalid picking list id"));
    }

    const list = await PickingList.findOne({ _id: id, organizationId }).lean();
    if (!list) return next(new ApiError(404, "Picking list not found"));

    return res.status(200).json(new ApiResponse(200, "Picking list fetched", list));
  } catch (error) {
    logger.error("Error in getPickingListById:", error);
    return next(new ApiError(error.statusCode || 500, error.message || "Internal Server Error"));
  }
});

export const assignPicker = asyncHandler(async (req, res, next) => {
  try {
    const organizationId = getOrgId(req);
    if (!organizationId) return next(new ApiError(401, "Organization context missing"));

    const { id } = req.params;
    const { pickerId } = req.body;
    if (!pickerId) return next(new ApiError(400, "pickerId is required"));

    const list = await PickingList.findOne({ _id: id, organizationId });
    if (!list) return next(new ApiError(404, "Picking list not found"));
    if (list.status !== "pending") {
      return next(new ApiError(400, "Only pending lists can be assigned"));
    }

    list.pickerId = pickerId;
    list.status = "assigned";
    list.updatedBy = getUserId(req);
    await list.save();

    await createAuditLog({
      organizationId,
      userId: getUserId(req),
      action: "PICKER_ASSIGNED",
      entityId: list._id,
      metadata: { pickerId },
      req,
    });

    return res.status(200).json(new ApiResponse(200, "Picker assigned", list));
  } catch (error) {
    logger.error("Error in assignPicker:", error);
    return next(new ApiError(error.statusCode || 500, error.message || "Internal Server Error"));
  }
});

export const pickItems = asyncHandler(async (req, res, next) => {
  try {
    const organizationId = getOrgId(req);
    if (!organizationId) return next(new ApiError(401, "Organization context missing"));

    const { id } = req.params;
    const { skuId, quantity } = req.body;
    if (!skuId || typeof quantity !== "number" || quantity <= 0) {
      return next(new ApiError(400, "skuId and quantity are required"));
    }

    const list = await PickingList.findOne({ _id: id, organizationId });
    if (!list) return next(new ApiError(404, "Picking list not found"));
    if (!["assigned", "picking"].includes(list.status)) {
      return next(new ApiError(400, "Picking list must be assigned or picking"));
    }

    const item = list.items.find((i) => String(i.skuId) === String(skuId));
    if (!item) return next(new ApiError(404, "Item not found in picking list"));

    const inv = await Inventory.findOne({
      organizationId,
      skuId: item.skuId,
      warehouseId: list.warehouseId,
      warehouseLocationId: item.locationId,
    });
    if (!inv) return next(new ApiError(400, "Bin inventory not found"));
    if (inv.quantityAvailable < quantity) {
      return next(new ApiError(400, "Insufficient bin inventory"));
    }

    const newPickedQty = item.pickedQuantity + quantity;
    if (newPickedQty > item.quantity) {
      return next(new ApiError(400, "Picked quantity exceeds required quantity"));
    }

    item.pickedQuantity = newPickedQty;
    list.status = "picking";

    const allPicked = list.items.every((i) => i.pickedQuantity >= i.quantity);
    if (allPicked) {
      list.status = "completed";
    }

    list.updatedBy = getUserId(req);
    await list.save();

    await createAuditLog({
      organizationId,
      userId: getUserId(req),
      action: "ITEM_PICKED",
      entityId: list._id,
      metadata: { skuId, quantity },
      req,
    });

    if (allPicked) {
      await createAuditLog({
        organizationId,
        userId: getUserId(req),
        action: "PICKING_COMPLETED",
        entityId: list._id,
        metadata: { orderId: list.orderId },
        req,
      });
    }

    return res.status(200).json(new ApiResponse(200, "Item picked", list));
  } catch (error) {
    logger.error("Error in pickItems:", error);
    return next(new ApiError(error.statusCode || 500, error.message || "Internal Server Error"));
  }
});

export const completePicking = asyncHandler(async (req, res, next) => {
  try {
    const organizationId = getOrgId(req);
    if (!organizationId) return next(new ApiError(401, "Organization context missing"));

    const { id } = req.params;
    const list = await PickingList.findOne({ _id: id, organizationId });
    if (!list) return next(new ApiError(404, "Picking list not found"));

    const allPicked = list.items.every((i) => i.pickedQuantity >= i.quantity);
    if (!allPicked) return next(new ApiError(400, "All items must be picked before completion"));

    list.status = "completed";
    list.updatedBy = getUserId(req);
    await list.save();

    await createAuditLog({
      organizationId,
      userId: getUserId(req),
      action: "PICKING_COMPLETED",
      entityId: list._id,
      metadata: { orderId: list.orderId },
      req,
    });

    return res.status(200).json(new ApiResponse(200, "Picking completed", list));
  } catch (error) {
    logger.error("Error in completePicking:", error);
    return next(new ApiError(error.statusCode || 500, error.message || "Internal Server Error"));
  }
});

