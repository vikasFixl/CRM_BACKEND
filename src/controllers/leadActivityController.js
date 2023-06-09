const { default: mongoose } = require("mongoose");
const LeadActivity = require("../models/LeadActivity");

exports.getLeadActivity = async (req, res) => {
  try {
    const { leadId } = req.params;
    const data = await LeadActivity.find({ leadId: leadId }).sort("-1");
    res.status(200).json({
      data: data,
      message: "Fetched Successfully.",
      success: true,
      status: 200,
    });
  } catch (err) {
    res.status(400).json({
      message: "Someting went wrong !",
      success: false,
      status: 400,
    });
  }
};

exports.getActivityByType = async (req, res) => {
  try {
    const { type, leadId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(leadId)) {
      return res.status(400).json({
        message: "Invalid leadId.",
        success: false,
        code: 400,
      });
    }
    const data = await LeadActivity.find({ leadId: leadId, type: type });
    if (!data) {
      return res.status(404).json({
        message: "No data found.",
        success: false,
        code: 404,
      });
    } else {
      res.status(200).json({
        data: data,
        message: "Fetched Successfully.",
        success: true,
        code: 200,
      });
    }
  } catch (err) {
    res.status(400).json({
      message: "Someting went wrong!",
      success: false,
      code: 400,
    });
  }
};

exports.updateLeadActivity = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: `Invalid Id`,
        success: false,
        status: 400,
      });
    }
    const activity = await LeadActivity.findById(id);
    if (!activity) {
      res.status(404).json({
        message: `Activity with id: ${id} not found.`,
        success: false,
        status: 404,
      });
    } else {
      const data = req.body;
      const options = { new: true };
      await LeadActivity.findByIdAndUpdate(id, data, options);
      res.json({
        success: true,
        status: 201,
        message: "Activity Updated Successfully.",
      });
    }
  } catch (err) {
    res.status(400).json({
      message: "Someting went wrong!",
      success: false,
      status: 400,
    });
  }
};

exports.deleteLeadActivity = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: `Invalid Id`,
        success: false,
        status: 400,
      });
    }
    const activity = await LeadActivity.findById(id);
    if (!activity) {
      res.status(404).json({
        message: `Lead with id: ${id} not found`,
        success: false,
        status: 404,
      });
    } else {
      await LeadActivity.findByIdAndDelete(id);
      res.status(202).json({
        message: `Activity with id: ${id} deleted successfully.`,
        success: true,
        status: 202,
      });
    }
  } catch (err) {
    res.status(400).json({
      message: "Someting went wrong!",
      success: false,
      status: 400,
    });
  }
};

exports.createLeadActivity = async (req, res) => {
  try {
    const url = req.protocol + "://" + req.get("host");
    var im = null;
    if (req.body.type === "Attachment") {
      if (req.file != undefined) {
        im = url + "/public/activity/" + req.file.filename;
      }
    }
    const activity = new LeadActivity({
      leadId: req.body.leadId,
      title: req.body.title,
      desc: req.body.desc,
      type: req.body.type,
      image: im,
      orgId: req.body.orgId,
      firmId: req.body.firmId,
    });
    await activity.save();
    res.status(201).json({
      message: "Saved Successfully.",
      success: true,
      status: 201,
    });
  } catch (err) {
    res.status(400).json({
      message: "Someting went wrong!",
      success: false,
      status: 400,
    });
  }
};

exports.getbyId = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: `Invalid Id`,
        success: false,
        status: 400,
      });
    }
    const data = await LeadActivity.find(id);
    res.status(200).json({
      data: data,
      message: "Fetched Successfully.",
      success: true,
      status: 200,
    });
  } catch (err) {
    res.status(400).json({
      message: "Someting went wrong !",
      success: false,
      status: 400,
    });
  }
};

exports.updateAttachment = async (req, res) => {
  try {
    const _id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(400).json({
        message: `Invalid Id`,
        success: false,
        status: 400,
      });
    }
    const url = req.protocol + "://" + req.get("host");
    if (req.file != undefined) {
      var im = url + "/public/activity/" + req.file.filename;
      await LeadActivity.findByIdAndUpdate(
        _id,
        { title: req.body.title, desc: req.body.desc, image: im },
        {
          new: true,
        }
      );
    } else {
      await LeadActivity.findByIdAndUpdate(
        _id,
        { desc: req.body.desc },
        {
          new: true,
        }
      );
    }
    res.json({
      success: true,
      status: 201,
      message: "Attachment Updated Successfully.",
    });
  } catch (error) {
    res.status(400).json({
      message: "Someting went wrong!",
      success: false,
      status: 400,
    });
  }
};
