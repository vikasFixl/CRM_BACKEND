const Lead = require("../models/leadModel");
const Client = require("../models/ClientModel");

exports.getList = async (req, res) => {
  try {
    const data = await Lead.find({ delete: false }).exec();
    res.json({
      data: data,
      success: true,
      message: "List of all Leads.",
      status: 200,
    });
  } catch (err) {
    res.json({
      message: "Someting went wrong !",
      success: false,
      status: 400,
    });
  }
};
exports.getDeletedList = async (req, res) => {
  try {
    const data = await Lead.find({ delete: true }).exec();
    res.json({
      data: data,
      success: true,
      message: "List of all Leads.",
      status: 200,
    });
  } catch (err) {
    res.json({
      message: "Someting went wrong !",
      success: false,
      status: 400,
    });
  }
};
exports.leadSearch = async (req, res) => {
  try {
    const data = await Lead.find({
      $or: [
        { clientFName: req.body.clientFName },
        { clientLName: req.body.clientLName },
        { clientEmail: req.body.clientEmail },
        { clientCity: req.body.clientCity },
        { clientCountry: req.body.clientCountry },
      ],
    }).exec();
    if (data.length === 0) {
      res.json({
        success: true,
        message: `No data found with - ${req.body.search}.`,
        status: 404,
      });
    } else {
      res.json({
        data: data,
        success: true,
        message: `Search res with - ${req.body.search}.`,
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
exports.leadById = async (req, res) => {
  try {
    let id = req.params.id;
    const data = await Lead.findById(id);
    if (data === null) {
      res.json({
        success: false,
        status: 404,
        message: "Lead not found",
      });
    } else {
      res.json({
        data: data,
        success: true,
        status: 200,
        message: `Lead with ${id}`,
      });
    }
  } catch (err) {
    res.json({
      success: false,
      status: 400,
      message: "Someting went wrong 1",
    });
  }
};
exports.addLead = async (req, res) => {
  try {
    const data = req.body;
    const lead = new Lead(data);
    await lead.save();
    res.json({
      success: true,
      message: "Lead saved successfully",
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
exports.updateLead = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await Lead.findById(id);
    if (data === null) {
      res.json({
        success: true,
        status: 404,
        message: "Lead not found!",
      });
    } else {
      const updatedData = req.body;
      const options = { new: true };
      await Lead.findByIdAndUpdate(id, updatedData, options);
      res.json({
        success: true,
        status: 201,
        message: "Lead Updated Successfully.",
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
exports.statusLead = async (req, res) => {
  try {
    const data = Lead.findById(req.params.id);
    if (data === null) {
      res.json({
        success: false,
        status: 404,
        message: "Lead not found.",
      });
    } else {
      const updatedData = req.params.status;
      const options = { new: true };
      await Lead.findOneAndUpdate(
        { _id: req.params.id },
        { $set: { status: updatedData } },
        options
      );
      if (req.params.status === "Won") {
        console.log(data, "data");
        res.json({
          success: true,
          status: 201,
          message: "Lead Status Updated.",
        });
      } else {
        res.json({
          success: true,
          status: 201,
          message: "Lead Status Updated.",
        });
      }
    }
  } catch (err) {
    res.json({
      success: false,
      status: 400,
      message: "Someting went wrong!",
    });
  }
};
exports.stageLead = async (req, res) => {
  try {
    const data = Lead.findById(req.params.id);
    if (data === null) {
      res.json({
        success: false,
        status: 404,
        message: "Lead not found.",
      });
    } else {
      const updatedData = req.params.stage;
      const options = { new: true };
      await Lead.findOneAndUpdate(
        { _id: req.params.id },
        { $set: { stage: updatedData } },
        options
      );
      res.json({
        success: true,
        status: 201,
        message: "Lead Stage Updated.",
      });
    }
  } catch (err) {
    res.json({
      success: false,
      status: 400,
      message: "Someting went wrong!",
    });
  }
};
exports.deleteLead = async (req, res) => {
  try {
    const data = await Lead.findById(req.params.id);
    if (data === null) {
      res.json({
        success: false,
        status: 404,
        message: "Lead not found.",
      });
    } else {
      const options = { new: true };
      await Lead.findOneAndUpdate(
        { _id: req.params.id },
        { $set: { delete: true } },
        options
      );
      res.json({
        success: true,
        status: 200,
        message: "Lead deleted successfully.",
      });
    }
  } catch (err) {
    res.json({
      success: false,
      status: 400,
      message: err,
    });
  }
};
exports.getByStatus = async (req, res) => {
  try {
    let status = req.params.status;
    const data = await Lead.find({ status: status, delete: false }).exec();
    res.json({
      data: data,
      success: true,
      status: 200,
      message: `List of Leads with status: ${status}`,
    });
  } catch (err) {
    res.json({
      success: false,
      status: 400,
      message: "Something went wrong.",
    });
  }
};

exports.transferLead=async(req,res)=>{
  try {
    const id = req.params.id;
    const data = await Lead.findById(id);
    if (data === null) {
      res.json({
        success: true,
        status: 404,
        message: "Lead not found!",
      });
    } else {
      const options = { new: true };
      await Lead.findByIdAndUpdate(id, {assignTo:req.body.assignTo}, options);
      res.json({
        success: true,
        status: 201,
        message: "Lead Transferred Successfully.",
      });
    }
  } catch (err) {
    res.json({
      message: "Something went wrong!",
      status: 400,
      success: false,
    });
  }
}