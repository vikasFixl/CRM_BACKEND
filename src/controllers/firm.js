import mongoose from "mongoose";

import { firmValidationSchema } from "../validations/firm/firmvalidation.js";
import Firm from "../models/FirmModel.js";

export const createFirm = async (req, res) => {
  try {
    // ✅ Validate with Zod
    const parsed = firmValidationSchema.safeParse(req.body);

    if (!parsed.success) {
      const errorMessages = parsed.error.errors.map((err) => err.message);
      return res.status(400).json({
        success: false,
        code: 400,
        message: "Validation failed.",
        errors: errorMessages,
      });
    }

    const form = parsed.data;

    // 🧠 Check for existing firm with same email
    const existingFirm = await Firm.findOne({ email: form.email });
    if (existingFirm) {
      return res.status(400).json({
        code: 400,
        success: false,
        message: `Firm already registered with ${form.email}.`,
      });
    }

    // ✅ Destructure the validated form
    const {
      name,
      email,
      phone,
      invoicePrefix,
      add,
      contectPerson,
      website,
      gst_no,
      logo,
      registeredFirmName,
      uin,
      tinNo,
      cinNo,
      orgId,
    } = form;

    // 🏗️ Create and save new firm
    const newFirm = new Firm({
      name,
      email,
      phone,
      invoicePrefix,
      add,
      contectPerson,
      website,
      gst_no,
      logo,
      registeredFirmName,
      uin,
      tinNo,
      cinNo,
      orgId,
    });

    await newFirm.save();

    return res.status(201).json({
      data: newFirm,
      code: 201,
      success: true,
      message: "Firm created successfully!",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Internal server error.",
      code: 500,
      success: false,
    });
  }
};



export const getFirm = async (req, res) => {
  try {
    const { orgId, id } = req.params;

    // ✅ Validate parameters
    if (!orgId) {
      return res.status(400).json({
        success: false,
        code: 400,
        message: 'Organization ID (orgId) is required in the URL.',
      });
    }

    if (!id) {
      return res.status(400).json({
        success: false,
        code: 400,
        message: 'Firm ID (id) is required in the URL.',
      });
    }

    // ✅ Fetch all firms for the given org
    const firmList = await Firm.find({ orgId });

    // ✅ Filter for the specific firm by _id
    const matchedFirm = firmList.find((firm) => firm._id.toString() === id);

    if (!matchedFirm) {
      return res.status(404).json({
        success: false,
        code: 404,
        message: 'Firm not found for the provided ID.',
      });
    }

    return res.status(200).json({
      data: matchedFirm,
      success: true,
      code: 200,
      message: 'Firm fetched successfully!',
    });

  } catch (err) {
    console.error('Error in getFirm:', err);
    return res.status(500).json({
      message: 'Internal server error.',
      code: 500,
      success: false,
    });
  }
};

export const getFirmList = async (req, res) => {
  try {
    const { orgId } = req.params;

    if (!orgId) {
      return res.status(400).json({
        success: false,
        code: 400,
        message: "Organization ID (orgId) is required in the URL.",
      });
    }

    const firms = await Firm.find({ orgId }).select("name").sort({ createdAt: -1 });

    return res.status(200).json({
      data: firms,
      success: true,
      code: 200,
      message: "Firm list fetched successfully!",
    });
  } catch (err) {
    console.error('Error in getFirmList:', err);
    return res.status(500).json({
      message: "Internal server error.",
      code: 500,
      success: false,
    });
  }
};
export const updateFirm = async (req, res) => {
  const { id: _id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(_id))
    return res.status(404).send("No firm with that id.");

  const parsed = firmUpdateValidationSchema.safeParse(req.body);
  if (!parsed.success) {
    const errors = parsed.error.errors.map(e => e.message);
    return res.status(400).json({ success: false, code: 400, message: "Validation failed", errors });
  }

  try {
    const updatedFirm = await Firm.findByIdAndUpdate(
      _id,
      { ...parsed.data, _id },
      { new: true }
    );

    res.status(200).json({
      data: updatedFirm,
      success: true,
      code: 200,
      message: "Firm updated!",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Internal server error.",
      code: 500,
      success: false,
    });
  }
};

export const deleteFirm = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).json({
      message: "No firm with that id.",
      code: 404,
      success: false,
    });

  try {
    const deletedFirm = await Firm.findByIdAndRemove(id);

    if (!deletedFirm) {
      return res.status(404).json({
        message: "Firm not found.",
        code: 404,
        success: false,
      });
    }

    res.status(200).json({
      message: "Firm deleted successfully!",
      code: 200,
      success: true,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Internal server error.",
      code: 500,
      success: false,
    });
  }
};

export const getAllFirm = async (req, res) => {
  const { orgId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(orgId)) {
    return res.status(400).json({
      message: "Invalid organization ID.",
      code: 400,
      success: false,
    });
  }

  try {
    const firmAll = await Firm.find({ orgId }).sort({ _id: -1 });

    res.status(200).json({
      data: firmAll,
      success: true,
      code: 200,
      message: "All firms retrieved successfully.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Internal server error.",
      code: 500,
      success: false,
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
    console.error(error);
    res.status(500).json({
      message: "Internal server error.",
      code: 500,
      success: false,
    });
  }
};









