const Lead = require("../models/leadModel");
const Client = require("../models/ClientModel");
const { default: mongoose } = require("mongoose");

/* Lead By Org */

exports.getListByOrg = async (req, res) => {
  try {
    const { orgId, deleted } = req.body;
    if (!mongoose.Types.ObjectId.isValid(orgId)) {
      return res.status(400).json({
        message: "Invaild Org Id.",
        success: false,
        status: 400,
      });
    }
    const lead = await Lead.find({ orgId: orgId, delete: deleted }).sort({
      _id: -1,
    });
    if (!lead) {
      res.json({
        success: true,
        message: "Leads not found.",
        status: 200,
      });
    } else {
      res.json({
        data: lead,
        success: true,
        message: "List of all Leads.",
        status: 200,
      });
    }
  } catch (err) {
    res.status(400).json({
      err: err,
    });
  }
};

exports.getByStatusByOrg = async (req, res) => {
  const { orgId, status } = req.body;
  if (!mongoose.Types.ObjectId.isValid(orgId)) {
    return res.status(400).json({
      message: "Invaild Org Id.",
      success: false,
      status: 400,
    });
  }
  const lead = await Lead.find({
    orgId: orgId,
    delete: false,
    status: status,
  }).sort({ _id: -1 });
  if (!lead) {
    res.json({
      success: true,
      message: "Leads not found.",
      status: 200,
    });
  } else {
    res.json({
      data: lead,
      success: true,
      message: "List of all Leads with status " + status,
      status: 200,
    });
  }
};

/* Lead By Firm */

exports.getListByFirm = async (req, res) => {
  const { firmId, deleted } = req.body;
  if (!mongoose.Types.ObjectId.isValid(firmId)) {
    return res.status(400).json({
      message: "Invaild firm Id.",
      success: false,
      status: 400,
    });
  }
  const lead = await Lead.find({ firmId: firmId, delete: deleted }).sort({
    _id: -1,
  });
  if (!lead) {
    res.json({
      success: true,
      message: "Leads not found.",
      status: 200,
    });
  } else {
    res.json({
      data: lead,
      success: true,
      message: "List of all Leads.",
      status: 200,
    });
  }
};

exports.getByStatusByFirm = async (req, res) => {
  const { firmId, status } = req.body;
  if (!mongoose.Types.ObjectId.isValid(firmId)) {
    return res.status(400).json({
      message: "Invaild firm Id.",
      success: false,
      status: 400,
    });
  }
  const lead = await Lead.find({
    firmId: firmId,
    delete: false,
    status: status,
  }).sort({ _id: -1 });
  if (!lead) {
    res.json({
      success: true,
      message: "Leads not found.",
      status: 200,
    });
  } else {
    res.json({
      data: lead,
      success: true,
      message: "List of all Leads with status " + status,
      status: 200,
    });
  }
};

/* Comman API's */

exports.leadById = async (req, res) => {
  let id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({
      success: false,
      status: 404,
      message: "Invalid id.",
    });
  }
  const data = await Lead.findById(id);
  if (!data) {
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
};

exports.addLeadByExcel = async (req, res) => {
  let { leads } = req.body;

  function generateUniqueRandomNumbers(min, max, count) {
    if (max - min + 1 < count) {
      throw new Error(
        "Cannot generate unique random numbers with given constraints."
      );
    }

    const numbers = Array.from({ length: max - min + 1 }, (_, i) => i + min);
    const uniqueRandomNumbers = [];

    while (uniqueRandomNumbers.length < count) {
      const randomIndex = Math.floor(Math.random() * numbers.length);
      const selectedNumber = numbers[randomIndex];

      // Remove the selected number from the list
      numbers.splice(randomIndex, 1);

      uniqueRandomNumbers.push(selectedNumber);
    }

    return uniqueRandomNumbers;
  }

  const min = 100;
  const max = 99999;
  const count = 1; // Change this to the number of unique random numbers you need

  const uniqueRandomNumbers = generateUniqueRandomNumbers(min, max, count);
  console.log(uniqueRandomNumbers);
  for (let i = 0; i < leads.length; i++) {
    await Lead.create({
      ...leads[i],
      randomLeadId: uniqueRandomNumbers[0],
    });
  }
  res.json({
    success: true,
    message: "Lead Excel Saved successfully",
    status: 201,
    // data: lead1
  });
};

exports.addLead = async (req, res) => {
  function generateUniqueRandomNumbers(min, max, count) {
    if (max - min + 1 < count) {
      throw new Error(
        "Cannot generate unique random numbers with given constraints."
      );
    }

    const numbers = Array.from({ length: max - min + 1 }, (_, i) => i + min);
    const uniqueRandomNumbers = [];

    while (uniqueRandomNumbers.length < count) {
      const randomIndex = Math.floor(Math.random() * numbers.length);
      const selectedNumber = numbers[randomIndex];

      // Remove the selected number from the list
      numbers.splice(randomIndex, 1);

      uniqueRandomNumbers.push(selectedNumber);
    }

    return uniqueRandomNumbers;
  }

  const min = 100;
  const max = 99999;
  const count = 1; // Change this to the number of unique random numbers you need

  const uniqueRandomNumbers = generateUniqueRandomNumbers(min, max, count);
  console.log(uniqueRandomNumbers);

  const newLead = new Lead({
    ...req.body,
    randomLeadId: uniqueRandomNumbers[0],
  });

  const lead1 = new Lead(newLead);
  await lead1.save();
  res.json({
    success: true,
    message: "Lead saved successfully",
    status: 201,
    data: lead1,
  });
};

exports.updateLead = async (req, res) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.json({
      success: true,
      status: 404,
      message: "Invaild id.",
    });
  }
  const data = await Lead.findById(id);
  if (!data) {
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
};

exports.leadSearch = async (req, res) => {
  try {
    const { search, orgId } = req.body;
    const newData = [];
    const data = await Lead.find({ orgId: orgId, delete: false }).sort({
      _id: -1,
    });
    data.filter((doc) => {
      console.log("doc", doc);
      for (const key in doc.toObject()) {
        if (doc[key] === search) {
          newData.push(doc);
        }
      }
      for (const key in doc.clientAddress.toObject()) {
        if (doc.clientAddress[key] === search) {
          newData.push(doc);
        }
      }
      for (const key in doc.pipeline.toObject()) {
        if (doc.pipeline[key] === search) {
          newData.push(doc);
        }
      }
      for (const key in doc.orgDetails.toObject()) {
        if (doc.orgDetails[key] === search) {
          newData.push(doc);
        }
      }
      for (const key in doc.orgDetails.orgAddress.toObject()) {
        if (doc.orgDetails.orgAddress[key] === search) {
          newData.push(doc);
        }
      }
    });
    res.json({
      data: newData,
      message: "Data List",
      success: false,
      status: 200,
      length: newData.length,
    });
  } catch (err) {
    res.json({
      message: "Someting went wrong !",
      success: false,
      status: 400,
    });
  }
};

exports.bulkDelete = async (req, res) => {
  try {
    const { leadIds } = req.body;
    console.log(leadIds);
    const result = await Lead.deleteMany({ _id: { $in: leadIds } });

    if (result.deletedCount > 0) {
      res.status(200).json({
        message: `${result.deletedCount} leads deleted successfully`,
        success: true,
      });
    } else {
      res.status(404).json({
        message: "No leads found to delete",
        success: false,
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};
