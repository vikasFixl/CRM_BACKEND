const { default: mongoose } = require("mongoose");
const LeadActivity = require("../models/LeadActivity");

var ts = Date.now();
var date_ob = new Date(ts);
var date = date_ob.getDate();
var month = date_ob.getMonth() + 1;
var year = date_ob.getFullYear();
var hours = date_ob.getHours();
var minutes = date_ob.getMinutes();
var seconds = date_ob.getSeconds();
var dateAndTime =
  year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds;

exports.getLeadActivity = async (req, res) => {
  try {
    const { leadId } = req.params;
    const data = await LeadActivity.find({ leadId: leadId })
      .populate("comment.userID", "firstName")
      .sort({ _id: -1 });
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
    const data = await LeadActivity.find({ leadId: leadId, type: type }).sort({ _id: -1 });
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
      details: req.body.details,
      type: req.body.type,
      image: im,
      orgId: req.body.orgId,
      firmId: req.body.firmId,
      activityDate: req.body.activityDate,
      activityTime: req.body.activityTime,
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
    const data = await LeadActivity.findById(id).populate(
      "comment.userID",
      "firstName"
    );
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

exports.addLeadActivityComment = async (req, res) => {
  const { comment, id } = req.body;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      message: `Invalid Id`,
      success: false,
      status: 400,
    });
  }
  comment.date = dateAndTime;
  await LeadActivity.findByIdAndUpdate(
    id,
    { $push: { comment: comment } },
    { new: true }
  );
  res.json({
    success: true,
    status: 201,
    message: "Comment added successfully.",
  });
};
exports.updateLeadActivityComment = async (req, res) => {
  const { commentId, updatedComment } = req.body;
  const { userId } = req.body; // Get user information from the request object

  // Validate commentId
  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    return res.status(400).json({
      message: `Invalid Comment Id`,
      success: false,
      status: 400,
    });
  }

  try {
    // const existingComment = await LeadActivity.findOneAndUpdate(
    //   { 'comment._id': commentId, 'comment.userID': userId }, // Match the commentId and userId
    //   { $set: { 'comment.$.comment': updatedComment, 'comment.$.date': new Date() } }, // Update the comment and date
    //   { new: true }
    // );
    const existingComment = await LeadActivity.findOneAndUpdate(
      {
        comment: {
          $elemMatch: { _id: commentId, userID: userId }, // Match commentId and userId within the comment array
        },
      },
      {
        $set: {
          "comment.$.comment": updatedComment,
          "comment.$.date": new Date(),
        }, // Update the comment and date
      },
      { new: true }
    );
    // Check if the comment with given commentId and userId exists
    if (!existingComment) {
      return res.status(404).json({
        message: `Comment not found or permission denied`,
        success: false,
        status: 404,
      });
    }

    res.json({
      success: true,
      status: 200,
      message: "Comment updated successfully.",
      data: existingComment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: `Internal Server Error`,
      success: false,
      status: 500,
    });
  }
};
exports.deleteLeadActivityComment = async (req, res) => {
  const { commentId, userId } = req.query; // Assuming commentId is passed as a route parameter

  console.log(" commentId, userId",  commentId, userId);
  // Validate commentId
  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    return res.status(400).json({
      message: `Invalid Comment Id`,
      success: false,
      status: 400,
    });
  }

  try {
    const updatedLeadActivity = await LeadActivity.findOneAndUpdate(
      {
        comment: {
          $elemMatch: { _id: commentId, userID: userId }, // Match commentId and userId within the comment array
        },
      },
      {
        $pull: { comment: { _id: commentId } }, // Remove the comment from the array
      },
      { new: true }
    );

    // Check if the comment with given commentId and userId exists
    if (!updatedLeadActivity) {
      return res.status(404).json({
        message: `Comment not found or permission denied`,
        success: false,
        status: 404,
      });
    }

    res.json({
      success: true,
      status: 200,
      message: "Comment deleted successfully.",
      data: updatedLeadActivity,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: `Internal Server Error`,
      success: false,
      status: 500,
    });
  }
};

exports.getLeadActivityComment = async (req, res) => {
  const data = await LeadActivity.find({ _id: req.params.id })
    .select("comment")
    .populate("comment.userID", "firstName");
  res.json({
    data: data,
    success: true,
    status: 201,
    message: "Comment added successfully.",
  });
};
