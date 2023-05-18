const productModel = require("../models/productModel");
const mongoose = require("mongoose");

exports.getAllProducts = async (req, res) => {
  const { firmId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(firmId)) {
    return res.status(400).json({
      message: "Firm id is not valid.",
      success: false,
    });
  }
  const data = await productModel.find({ firmId: firmId });
  if (data.length === 0) {
    res.status(404).json({
      message: "No Data found.",
      success: true,
    });
  } else {
    res.status(200).json({
      data: data,
      message: "List of products.",
      success: true,
    });
  }
};
exports.getProductDetails = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      message: "Product id is not valid.",
      success: false,
    });
  }
  const data = await productModel.findById(id);
  if (data.length === 0) {
    res.status(404).json({
      message: "No Data found.",
      success: true,
    });
  } else {
    res.status(200).json({
      data: data,
      message: "Product details.",
      success: true,
    });
  }
};
exports.createProduct = async (req, res) => {
  const form = req.body;
  const data = new productModel(form);
  await data.save();
  res.status(201).json({
    message: "Product saved.",
    success: true,
  });
};
exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      message: "Product id is not valid.",
      success: false,
    });
  } else {
    const form = req.body;
    await productModel.findByIdAndUpdate(id, form, { new: true });
    res.status(201).json({
      message: "Product updated.",
      success: true,
    });
  }
};
exports.softDeleteProduct = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      message: "Product id is not valid.",
      success: false,
    });
  } else {
    const form = req.body;
    await productModel.findByIdAndUpdate(id, form, { new: true });
    res.status(201).json({
      message: "Product delete updated.",
      success: true,
    });
  }
};
exports.deleteProduct = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      message: "Product id is not valid.",
      success: false,
    });
  } else {
    await productModel.findByIdAndDelete(id);
    res.status(201).json({
      message: "Product deleted.",
      success: true,
    });
  }
};
