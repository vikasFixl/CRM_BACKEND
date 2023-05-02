const vendorModel = require("../models/vendorModel");
const mongoose = require("mongoose");

exports.getAllVendor = async (req, res) => {
  const { orgId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(orgId))
    return res.status(404).json({
      message: "Wrong object id.",
      success: false,
    });

  const data = await vendorModel.find({ orgId: orgId }).sort("-1");
  if (data.length === 0) {
    res.status(200).json({
      message: "No vendors found.",
      success: true,
    });
  } else {
    res.status(200).json({
      message: "List of all vendors.",
      data: data,
      success: true,
    });
  }
};

exports.getVendorById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).json({
      message: "Wrong object id.",
      success: false,
    });

  const data = await vendorModel.findById(id);
  if (!data) {
    res.status(200).json({
      message: "No vendors found.",
      success: true,
    });
  } else {
    res.status(200).json({
      data: data,
      message: "Vendors details.",
      success: true,
    });
  }
};

exports.getVendorByFirm = async (req, res) => {
  const { firmId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(firmId))
    return res.status(404).json({
      message: "Wrong object id.",
      success: false,
    });

  const data = await vendorModel.find({ firmId: firmId }).sort("-1");
  if (data.length === 0) {
    res.status(200).json({
      message: "No vendors found.",
      success: true,
    });
  } else {
    res.status(200).json({
      message: "List of all vendors.",
      data: data,
      success: true,
    });
  }
};

exports.createVendor = async (req, res) => {
  const data = req.body;
  const newVendor = new vendorModel(data);
  await newVendor.save();
  res.status(201).json({
    success: true,
    message: "Vendor created.",
  });
};

exports.updateVendor = async (req, res) => {
  const data = req.body;
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).json({
      message: "Wrong object id.",
      success: false,
    });

  await vendorModel.findByIdAndUpdate(id, data, { new: true });
  res.status(201).json({
    success: true,
    message: "Vendor updated.",
  });
};

exports.softDeleteVendor = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).json({
      message: "Wrong object id.",
      success: false,
    });

  await vendorModel.findByIdAndUpdate(id, { delete: true }, { new: true });
  res.status(201).json({
    success: true,
    message: "Vendor deleted.",
  });
};

exports.restoreVendor = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).json({
      message: "Wrong object id.",
      success: false,
    });

  await vendorModel.findByIdAndUpdate(id, { delete: false }, { new: true });
  res.status(201).json({
    success: true,
    message: "Vendor restored.",
  });
};

exports.deleteVendor = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).json({
      message: "Wrong object id.",
      success: false,
    });

  await vendorModel.findByIdAndDelete(id);
  res.status(204).json({
    success: true,
    message: "Vendor deleted from DB.",
  });
};
