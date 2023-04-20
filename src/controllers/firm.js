const mongoose = require("mongoose");
const FirmModel = require("../models/FirmModel");

exports.createFirm = async (req, res) => {
  try {
    const form = req.body;
    const data = await FirmModel.findOne({ email: form.email });
    if (data) {
      res.status(400).json({
        code: 400,
        success: false,
        message: `Firm already registered with ${form.email}.`,
      });
    } else {
      const newFirm = new FirmModel(form);
      await newFirm.save();
      res.status(201).json({
        code: 201,
        success: true,
        message: "Firm created successfully!",
      });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({
      message: err,
      code: 400,
      success: false,
    });
  }
};

exports.getFirm = async (req, res) => {
  const { org } = req.params;
  const { id } = req.params;
  try {
    const newData = [];
    const firm = await FirmModel.find({ orgId: org });
    firm.forEach((element) => {
      if (element._id == id) {
        newData.push(element);
      }
    });

    res.status(200).json({
      data: newData,
      success: true,
      code: 200,
      message: "single firm fetch!!",
    });
  } catch (err) {
    res.status(409).json({
      message: err.message,
      code: 400,
      success: false,
    });
  }
};

exports.updateFirm = async (req, res) => {
  const { id: _id } = req.params;
  const firm = req.body;

  if (!mongoose.Types.ObjectId.isValid(_id))
    return res.status(404).send("No firm with that id. ");
  const updatedFirm = await FirmModel.findByIdAndUpdate(
    _id,
    { ...firm, _id },
    { new: true }
  );
  res.status(200).json({
    data: updatedFirm,
    success: true,
    code: 201,
    message: "Firm updated!",
  });
};

exports.deleteFirm = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).send(" no firm with that id. ");
  await FirmModel.findByIdAndRemove(id);

  res.json({
    message: "Firm deleted successfully!",
    code: 200,
    success: true,
  });
};

exports.getAllFirm = async (req, res) => {
  const { org } = req.params;
  try {
    const firmAll = await FirmModel.find({ orgId: org }).sort({ _id: -1 });

    res.status(200).json({
      data: firmAll,
      success: true,
      code: 200,
      message: "all firms get here!!",
    });
  } catch (err) {
    res.status(409).json({
      message: err.message,
      code: 409,
      success: false,
    });
  }
};

exports.logo = async (req, res) => {
  try {
    const url = req.protocol + "://" + req.get("host");
    const _id = req.params.id;
    const image = await FirmModel.findByIdAndUpdate(
      _id,
      { logo: req.file.location },
      {
        new: true,
      }
    );
    res.status(201).json({
      logo: image,
      code: 201,
      success: true,
      message: "logo Updated successfully!",
    });
  } catch (error) {
    res.status(400).json({
      message: err.message,
      code: 400,
      success: false,
    });
  }
};
