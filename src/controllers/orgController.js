const Org = require("../models/OrgModel");

exports.getOrgData = async (req, res) => {
  try {
    const data = await Org.find({ orgEmail: req.params.email }).exec();
    if (data.length === 0) {
      res.json({
        success: true,
        message: "Org data not found.",
        status: 200,
      });
    } else {
      res.json({
        data: data,
        success: true,
        message: "Org Data.",
        status: 200,
      });
    }
  } catch (err) {
    res.json({
      message: "Someting went wrong !",
      success: false,
      status: 400,
    });
  }
};
exports.updateOrgData = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await Org.findById(id);
    if (data === null) {
      res.json({
        success: true,
        status: 404,
        message: "Org not found!",
      });
    } else {
      const updatedData = req.body;
      const options = { new: true };
      await Org.findByIdAndUpdate(id, updatedData, options);
      res.json({
        success: true,
        status: 201,
        message: "Org Updated Successfully.",
      });
    }
  } catch (err) {
    res.json({
      message: "Something went wrong!",
      status: 400,
      success: false,
    });
  }
};
exports.addOrg = async (req, res) => {
  try {
    const data = req.body;
    const org = new Org(data);
    await org.save();
    res.json({
      success: true,
      message: "Org saved successfully",
      status: 201,
    });
  } catch (err) {
    res.json({
      message: "Someting went wrong!",
      status: 400,
      success: false,
    });
  }
};