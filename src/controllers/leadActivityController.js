const LeadActivity = require("../models/LeadActivity");

exports.getLeadActivity = async (req, res) => {
  try {
    const id = req.params.LId;
    const data = await LeadActivity.find({ id });
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
    const Type = req.params.type;
    const id = req.params.LId;
    const data = await LeadActivity.find({ leadId: id }).exec();
    if (data.length === 0) {
      res.status(200).json({
        data: "No Data Found",
        message: "Fetched Successfully.",
        success: true,
        status: 200,
      });
    } else {
      let sendData = [];
      data.forEach((element) => {
        if (element.type === Type) {
          sendData.push(element);
        }
      });
      res.status(200).json({
        data: sendData,
        message: "Fetched Successfully.",
        success: true,
        status: 200,
      });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({
      message: "Someting went wrong!",
      success: false,
      status: 400,
    });
  }
};
exports.createLeadActivity = async (req, res) => {
  try {
    const data = req.body;
    const activity = new LeadActivity(data);
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

exports.updateLeadActivity = async (req, res) => {
  try {
    const { id } = req.params;
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
