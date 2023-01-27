const express = require("express");
const mongoose = require("mongoose");
const FirmModel = require("../models/FirmModel");

exports.createFirm = async (req, res) => {
  try {
    const url = req.protocol + '://' + req.get('host')
    const newFirm = new FirmModel({
      logo:url + '/public/firm/' + req.file.filename,
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      add: req.body.add,
      website: req.body.website,
      gst_no: req.body.gst_no,
      uin:req.body.uin
    });
    await newFirm.save();
    res.status(201).json({
      data: newFirm,
      code: 201,
      success: true,
      message: "Firm created successfully!",
    });
  } catch (err) {
    res.status(400).json({ message: "something went wrong! " });
  }
};

exports.getFirm = async (req, res) => {
  const { id } = req.params;
  try {
    const firm = await FirmModel.findById(id);

    res.status(200).json({
      data: firm,
      success: true,
      code: 200,
      message: "single firm fetch!!",
    });
  } catch (err) {
    res.status(409).json({ message: err.message });
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
  res.json(updatedFirm);
};

exports.deleteFirm = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).send(" no firm with that id. ");
  await FirmModel.findByIdAndRemove(id);

  res.json({ message: "Firm deleted successfully!" });
};

exports.getAllFirm = async (req, res) => {
  try {
    const firmAll = await FirmModel.find({}).sort({ _id: -1 });

    res.status(200).json({
      data: firmAll,
      success: true,
      code: 200,
      message: "all firms get here!!",
    });
  } catch (err) {
    res.status(409).json(err.message);
  }
};

exports.logo=async(req,res)=>{
  try {
    const url = req.protocol + '://' + req.get('host')
    const _id=req.params.id;
    const image=await FirmModel.findByIdAndUpdate(_id,{logo:url + '/public/firm/' + req.file.filename},{
      new:true
    })
    res.status(201).json({
      "logo":image.path,
      code: 201,
      success: true,
      message: "logo Updated successfully!",
    })
  } catch (error) {
    res.status(400).json({ message: "something went wrong! " });
  }
}
