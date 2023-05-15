const attendenceModel = require("../models/attendenceModel");

exports.attendence = async (req, res) => {
  try {
    const empid = req.params.eid;
    //console.log(empid);
    const check = await attendenceModel.findOne({ eid: empid });
    //console.log(check);
    if (!check) {
      const Attendence = new attendenceModel({
        eid: empid,
        attendence: req.body,
      });
      await Attendence.save();
      res.status(201).json({
        success: true,
        code: 201,
        message: "Attendence Marked Succesfully",
      });
    } else {
      for (var i = 0; i <= check.attendence.length - 1; i++) {
        if (
          check.attendence[i].date.toISOString().slice(0, 10) ===
          req.body.date.slice(0, 10)
        ) {
          return res.json({ message: "Attendence already Marked for today" });
        }
      }
      const data = await attendenceModel.updateOne(
        { eid: empid },
        { $push: { attendence: req.body } }
      );
      res.status(201).json({
        data: data,
        success: true,
        code: 201,
        message: "Attendence marked",
      });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      code: 400,
      message: error.message,
    });
  }
};

exports.markExit = async (req, res) => {
  try {
    const empid = req.params.eid;
    const data = await attendenceModel.findOne({ eid: empid });
    console.log(req.body.exit.slice(0, 10));
    for (var i = 0; i <= data.attendence.length - 1; i++) {
      //console.log(i);
      if (
        data.attendence[i].date.toISOString().slice(0, 10) ===
        req.body.exit.slice(0, 10)
      ) {
        //console.log("hwiqhro");
        // data.attendence[i].exit=req.body.exit
        // console.log(data.attendence[i].exit);
        const d = await attendenceModel.updateOne(
          { "attendence.exit": data.attendence[i].exit },
          { $set: { "attendence.$.exit": req.body.exit } }
        );
        break;
        //console.log(d);
      }
    }
    res.status(200).json({
      success: true,
      code: 200,
      message: "Attendence updated",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

exports.leave = async (req, res) => {
  try {
    const empid = req.params.eid;
    const check = await attendenceModel.findOne({ eid: empid });
    if (!check) {
      res.status(201).json({
        success: true,
        code: 201,
        message: "leaves Asked.",
      });
    }
    //console.log(check);
    else {
      const data = await attendenceModel.updateOne(
        { eid: empid },
        { $push: { leaves: req.body } }
      );
      res.status(201).json({
        data: data,
        success: true,
        code: 201,
        message: "leaves requested",
      });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      code: 400,
      message: error.message,
    });
  }
};

exports.getLeavesRecord = async (req, res) => {
  try {
    const empid = req.params.eid;
    const data = await attendenceModel.findOne({ eid: empid });
    res.status(201).json({
      data: data.leaves,
      success: true,
      code: 201,
      message: "leaves Record fetched",
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      code: 404,
      message: "leaves Record Not Found",
    });
  }
};

exports.getAttendenceRecord = async (req, res) => {
  try {
    const empid = req.params.eid;
    const data = await attendenceModel.findOne({ empid });
    res.status(201).json({
      data: data.attendence,
      success: true,
      code: 201,
      message: "Attendence Record fetched",
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      code: 404,
      message: "Attendence Record Not Found",
    });
  }
};

exports.attendenceData = async (req, res) => {
  const data = await attendenceModel.find();
  res.send(data);
};

exports.updateLeaves = async (req, res) => {
  try {
    const empid = req.params.eid;
    const data = await attendenceModel.findOne({ eid: empid });
    for (var i = 0; i <= data.leaves.length - 1; i++) {
      //console.log(data.leaves[i].adminStatus);
      if (data.leaves[i].adminStatus === "Awaiting") {
        const up = await attendenceModel.updateOne(
          { eid: empid, "leaves.adminStatus": data.leaves[i].adminStatus },
          { $set: { "leaves.$.adminStatus": req.body.adminStatus } }
        );
        return res.json({
          data: up,
          message: "Status Updated",
        });
      }
    }
  } catch (error) {
    res.json({
      message: error.message,
    });
  }
};
