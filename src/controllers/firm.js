import mongoose from "mongoose";

import {
  firmUpdateSchema,
  firmValidationSchema,
} from "../validations/firm/firmvalidation.js";
import Firm from "../models/FirmModel.js";
import ActivityModel from "../models/activityModel.js";
import { uploadImageToCloudinary } from "../utils/helperfuntions/uploadimage.js";
import { paginateQuery } from "../utils/pagination.js";
import logger from "../../config/logger.js";

export const createFirm = async (req, res) => {
  try {
    const userId = req.user.userId;
    const loggedinuserEmail = req.user.email;
    const orgId = req.orgUser.orgId;
    const empid = req.orgUser.employeeId;
    // logger.info(userId, orgId, empid, loggedinuserEmail, "createFirm");
    // ✅ Validate with Zod
    const parsed = firmValidationSchema.safeParse(req.body);
    if (!parsed.success) {
      logger.info(parsed.error);
      return res.status(400).json({
        message: "Validation error",
        errors: parsed.error.errors.map((e) => e.message),
      });
    }

    const form = parsed.data;

    // 🧠 Check for existing firm with same GST, TIN, CIN
    const existing = await Firm.findOne({
      orgId,
      isDeleted: { $ne: true },
      $or: [
        { gst_no: form.gst_no },
        { tinNo: form.tinNo },
        { cinNo: form.cinNo },
      ],
    });

    // Check which field is duplicated
    if (existing) {
      let duplicateFields = [];

      if (existing.gst_no === form.gst_no) {
        duplicateFields.push("GST number");
      }

      if (existing.tinNo === form.tinNo) {
        duplicateFields.push("TIN number");
      }

      if (existing.cinNo === form.cinNo) {
        duplicateFields.push("CIN number");
      }

      return res.status(400).json({
        message: `${duplicateFields.join(", ")} already exist${
          duplicateFields.length > 1 ? "" : "s"
        }.`,
      });
    }

    // 🧠 Check for existing firm with same email
    const existingFirm = await Firm.findOne({
      orgId,
      isDeleted: { $ne: true },
      $or: [{ email: form.email }, { FirmName: form.FirmName }],
    });

    if (existingFirm) {
      return res.status(400).json({
        message: `Firm already registered with same email or Firm name.`,
        code: 400,
        success: false,
      });
    }

    // ✅ Destructure the validated form
    const {
      FirmName,
      email,
      phone,
      invoicePrefix,
      add,
      contactPerson,
      website,
      gst_no,
      uin,
      tinNo,
      cinNo,
    } = form;

    //  Create and save new firm
    const newFirm = new Firm({
      FirmName,
      email,
      phone,
      invoicePrefix,
      add,
      contactPerson,
      website,
      gst_no,
      uin,
      tinNo,
      cinNo,
      orgId,
    });
    if (req.files && req.files.image) {
      const { image } = req.files;

      const cloudinaryResponse = await uploadImageToCloudinary({
        file: image,
        folder: "firm/avatar", // or any dynamic folder
        // only if replacing
      });

      // logger.info(cloudinaryResponse, "cloudinaryResponse");
      newFirm.FirmLogo = {
        url: cloudinaryResponse.url,
        public_id: cloudinaryResponse.public_id,
      };
    }

    await newFirm.save();
    // ✅ Add activity
    const activity = new ActivityModel({
      activityDesc: `Firm created by ${loggedinuserEmail} with id ${empid}`,
      userId,
      orgId,
      activity: "create",
      module: "firm",
      entityId: newFirm._id,
    });
    await activity.save();

    return res.status(201).json({
      message: "Firm created successfully!",
      data: newFirm,
      code: 201,
      success: true,
    });
  } catch (err) {
    logger.error(err);
    return res.status(500).json({
      message: "Internal server error.",
      code: 500,
      success: false,
    });
  }
};

export const getFirmbyId = async (req, res) => {
  try {
    const { id } = req.params;
    const orgId = req.orgUser.orgId;

    // ✅ Validate parameters
    if (!orgId) {
      return res.status(400).json({
        message: "Organization ID (orgId) is required in the URL.",
        success: false,
        code: 400,
      });
    }

    if (!id) {
      return res.status(400).json({
        message: "Firm ID (id) is required in the URL.",
        success: false,
        code: 400,
      });
    }

    // ✅ Fetch all firms for the given org
    const firm = await Firm.findOne({
      orgId: orgId,
      _id: id,
      isDeleted: { $ne: true },
    });

    if (!firm) {
      return res.status(400).json({
        message: "Firm not found.",
        success: false,
        code: 400,
      });
    }

    return res.status(200).json({
      message: "Firm fetched successfully!",
      data: firm,
      success: true,
      code: 200,
    });
  } catch (err) {
    logger.error("Error in getFirm:", err);
    return res.status(500).json({
      message: "Internal server error.",
      code: 500,
      success: false,
    });
  }
};

export const getFirmList = async (req, res) => {
  try {
    const orgId = req.orgUser.orgId;
    const { page = 1, limit = 10 } = req.query;

    const filter = { orgId, isDeleted: { $ne: true } };

    const result = await paginateQuery(Firm, filter, {
      page,
      limit,
      sort: { createdAt: -1 },
    });

    // Only return FirmName in each item
    let firms = result.data.map((firm) => ({
      _id: firm._id,
      FirmName: firm.FirmName,
    }));
    // logger.info("finaldata",finaldata)
    return res.status(200).json({
      message: "Firm list fetched successfully!",
      success: true,
      code: 200,
      firms,
    });
  } catch (err) {
    logger.error("Error in getFirmList:", err);
    return res.status(500).json({
      message: "Internal server error.",
      code: 500,
      success: false,
    });
  }
};
export const updateFirm = async (req, res) => {
  const { id: _id } = req.params;
  const userId = req.user.userId;
  const loggedinuserEmail = req.user.email;
  const orgId = req.orgUser.orgId;
  const empid = req.orgUser.employeeId;

  if (!mongoose.Types.ObjectId.isValid(_id))
    return res.status(404).send("No firm with that id.");

  const parsed = firmUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: "Validation error",
      errors: parsed.error.errors.map((e) => e.message),
    });
  }

  try {
    const updatedFirm = await Firm.findOneAndUpdate(
      { _id, isDeleted: { $ne: true } }, // ✅ filter
      { ...parsed.data }, // ✅ update data
      { new: true } // ✅ return the updated document
    );

    updatedFirm.save();

    // ✅ Add activity
    const activity = new ActivityModel({
      activityDesc: `Firm updated by ${loggedinuserEmail} with id ${empid}`,
      userId,
      orgId,
      activity: "update",
      module: "firm",
      entityId: updatedFirm._id,
    });
    await activity.save();
    res.status(200).json({
      message: "Firm updated successfully!",

      success: true,
      code: 200,
    });
  } catch (err) {
    logger.error(err);
    res.status(500).json({
      message: "Internal server error.",
      code: 500,
      success: false,
    });
  }
};

export const deleteFirm = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;
  const loggedinuserEmail = req.user.email;
  const orgId = req.orgUser.orgId;
  const empid = req.orgUser.employeeId;

  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).json({
      message: "invalid id.",
      code: 404,
      success: false,
    });

  try {
    const deletedFirm = await Firm.findByIdAndUpdate(id, {
      isDeleted: true,
      deletedAt: new Date(),
    });

    if (!deletedFirm) {
      return res.status(404).json({
        message: "Firm not found.",
        code: 404,
        success: false,
      });
    }
    // ✅ Add activity
    const activity = new ActivityModel({
      activityDesc: `Firm deleted by ${loggedinuserEmail} with id ${empid}`,
      userId,
      orgId,
      activity: "delete",
      module: "firm",
      entityId: deletedFirm._id,
    });
    await activity.save();
    res.status(200).json({
      message: "Firm deleted successfully!",
      code: 200,
      success: true,
    });
  } catch (err) {
    logger.error(err);
    res.status(500).json({
      message: "Internal server error.",
      code: 500,
      success: false,
    });
  }
};

export const getAllFirm = async (req, res) => {
  const orgId = req.orgUser.orgId;
  const { page = 1, limit = 10 } = req.query;

  try {
    const result = await paginateQuery(
      Firm,
      { orgId, isDeleted: { $ne: true } },
      { page, limit }
    );

    let firms = result.data;
    res.status(200).json({
      message: "All firms retrieved successfully.",
      success: true,
      code: 200,
      firms,
    });
  } catch (err) {
    logger.error(err);
    res.status(500).json({
      message: "Internal server error.",
      code: 500,
      success: false,
    });
  }
};
// need restore_firm permission
export const RestoreFirm = async (req, res) => {
  const { id } = req.params;
  // const orgId = req.orgUser.orgId;
  const userId = req.user.userId;
  const loggedinuserEmail = req.user.email;
  const orgId = req.orgUser.orgId;
  const empid = req.orgUser.employeeId;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      code: 400,
      message: "Invalid firm ID.",
    });
  }

  if (!id) {
    return res.status(400).json({
      message: "firm id is missing.",
      success: false,
      code: 400,
    });
  }

  try {
    // Find the firm that matches orgId and is soft-deleted
    const firm = await Firm.findOne({
      _id: id,
      orgId,
      isDeleted: true,
    });
    if (!firm) {
      return res.status(404).json({
        message: "Soft-deleted firm not found for this organization.",
        success: false,
        code: 404,
      });
    }
    // Restore the firm
    firm.isDeleted = false;
    firm.deletedAt = null;
    await firm.save();
    // ✅ Add activity
    const activity = new ActivityModel({
      activityDesc: `Firm restored by ${loggedinuserEmail} with id ${empid}`,
      userId,
      orgId,
      activity: "restore",
      module: "firm",
      entityId: firm._id,
    });
    await activity.save();
    return res.status(200).json({
      message: "Firm restored successfully.",
      success: true,
      code: 200,
    });
  } catch (error) {
    logger.error("Error in restoreFirm:", error);
    return res.status(500).json({
      message: "Internal server error.",
      success: false,
      code: 500,
    });
  }
};
// get-all-delted-firm permission
export const getAllDeletedFirm = async (req, res) => {
  try {
    const orgId = req.orgUser?.orgId;
    const { page = 1, limit = 10 } = req.query;

    const filter = { orgId, isDeleted: true };

    const result = await paginateQuery(Firm, filter, {
      page,
      limit,
      sort: { updatedAt: -1 },
    });

    const firms = result.data;
    return res.status(200).json({
      message: "Soft-deleted firms fetched successfully.",
      success: true,
      code: 200,
      firms,
    });
  } catch (error) {
    logger.error("Error in getAllDeletedFirm:", error);
    return res.status(500).json({
      success: false,
      code: 500,
      message: "Internal server error.",
    });
  }
};
export const logo = async (req, res) => {
  const _id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(400).json({
      message: "Invalid firm ID.",
      code: 400,
      success: false,
    });
  }

  if (!req.file || !req.file.location) {
    return res.status(400).json({
      message: "No logo file uploaded.",
      code: 400,
      success: false,
    });
  }

  try {
    const updatedFirm = await Firm.findByIdAndUpdate(
      _id,
      { logo: req.file.location },
      { new: true }
    );

    if (!updatedFirm) {
      return res.status(404).json({
        message: "Firm not found.",
        code: 404,
        success: false,
      });
    }

    res.status(201).json({
      data: updatedFirm,
      code: 201,
      success: true,
      message: "Logo updated successfully!",
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      message: "Internal server error.",
      code: 500,
      success: false,
    });
  }
};
