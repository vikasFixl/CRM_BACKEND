const empModel = require("../models/employeeModel");
const user = require("../models/userModel");

exports.empGet = async (req, res) => {
  const { orgId } = req.params;
  const data = await empModel.find({ orgId: orgId });
  if (data.length === 0) {
    res.status(200).json({
      message: `No Data found with ${orgId}`,
      success: true,
      data: data,
    });
  } else {
    res.status(200).json({
      data: data,
      success: true,
      message: `Data found with ${orgId}`,
    });
  }
};

exports.create = async (req, res) => {
  const {
    firstName,
    lastName,
    orgId,
    firmId,
    eidPrefix,
    gender,
    skills,
    dob,
    doj,
    designation,
    panNo,
    bankDetails,
    email,
    department,
    phone,
    password,
  } = req.body;
  if (!firmId) {
    const data = await empModel
      .find({ orgId: orgId })
      .select("eid")
      .sort({ eid: -1 });
    let newEmpId = 0;
    if (data.length == 0) {
      newEmpId = 1;
    } else {
      newEmpId = parseInt(data[0].eid) + 1;
    }
    const newUser = new user({
      firstName: firstName,
      lastName: lastName,
      email: email,
      role: "employee",
      designation: designation,
      department: department,
      phone: phone,
      password: password,
      eid: newEmpId,
      orgId: orgId,
    });
    const userData = await newUser.save();
    const newEmp = new empModel({
      firstName: firstName,
      lastName: lastName,
      orgId: orgId,
      userId: userData._id,
      eid: newEmpId,
      gender: gender,
      skills: skills,
      dob: dob,
      doj: doj,
      eidPrefix: eidPrefix,
      designation: designation,
      panNo: panNo,
      bankDetails: bankDetails,
    });
    await newEmp.save();
    res.status(201).json({
      success: true,
      message: `Employee created.`,
    });
  } else {
    const data = await empModel
      .find({ firmId: firmId })
      .select("eid")
      .sort({ eid: -1 });
    let newEmpId = 0;
    if (data.length == 0) {
      newEmpId = 1;
    } else {
      newEmpId = parseInt(data[0].eid) + 1;
    }
    const newUser = new user({
      firstName: firstName,
      lastName: lastName,
      email: email,
      role: "employee",
      designation: designation,
      department: department,
      phone: phone,
      password: password,
      eid: newEmpId,
      orgId: orgId,
      firmId: firmId,
    });
    const userData = await newUser.save();
    const newEmp = new empModel({
      firstName: firstName,
      lastName: lastName,
      orgId: orgId,
      firmId: firmId,
      userId: userData._id,
      eid: newEmpId,
      gender: gender,
      skills: skills,
      dob: dob,
      doj: doj,
      eidPrefix: eidPrefix,
      designation: designation,
      panNo: panNo,
      bankDetails: bankDetails,
    });
    await newEmp.save();
    res.status(201).json({
      success: true,
      message: `Employee created.`,
    });
  }
};

exports.empUpdate = async (req, res) => {
  const { id } = req.params;
  const emp = req.body;
  await empModel.findByIdAndUpdate(id, emp, { new: true });
  res.status(201).json({
    message: "Employee updated.",
    success: true,
  });
};
