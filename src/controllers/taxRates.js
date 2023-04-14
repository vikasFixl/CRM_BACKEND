const taxModel = require("../models/taxModel");

exports.addTaxInFirm = async (req, res) => {
  try {
    const tax = req.body;
    const data = await taxModel.find({ firmId: tax.firmId });
    if (data.length === 0) {
      const newTax = new taxModel(tax);
      newTax.save();
      res.status(201).json({
        code: 201,
        success: true,
        message: "Firm tax created successfully!",
      });
    } else {
      req.body.taxRates.forEach(async (element) => {
        await taxModel.updateOne(
          { _id: data[0]._id },
          { $push: { taxRates: element } }
        );
      });
      res.status(201).json({
        code: 201,
        success: true,
        message: "Firm tax updated successfully!",
      });
    }
    // else {
    //   data.forEach((element1) => {
    //     req.body.taxRates.forEach(async (element) => {
    //       await taxModel.updateOne(
    //         { _id: element1._id },
    //         { $push: { taxRates: element } }
    //       );
    //     });
    //   });
    //   res.status(201).json({
    //     code: 201,
    //     success: true,
    //     message: "Firm tax updated successfully!",
    //   });
    // }
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "something went wrong! ",
      success: false,
    });
  }
};

exports.postGlobalTax = async (req, res) => {
  try {
    const tax = req.body;
    const orgData = await taxModel.find({
      orgId: tax.orgId,
      firmId: undefined,
    });
    if (orgData.length === 0) {
      const newTax = new taxModel(tax);
      newTax.save();
      res.status(201).json({
        code: 201,
        success: true,
        message: "Global tax created successfully!",
      });
    } else {
      req.body.taxRates.forEach(async (element) => {
        await taxModel.updateOne(
          { _id: orgData[0]._id },
          { $push: { taxRates: element } }
        );
      });
      res.status(201).json({
        code: 201,
        success: true,
        message: "Global tax updated successfully!",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "something went wrong! ",
      success: false,
    });
  }
};

exports.gettaxrates = async (req, res) => {
  try {
    const firmId = req.params.firmId;
    const data = await taxModel.find({ firmId: firmId }).sort({ id: -1 });
    res.status(200).json({
      data: data,
      code: 200,
      success: true,
      message: "all data get here!!",
    });
  } catch (error) {
    res.status(409).json(error.message);
  }
};

exports.getGlobalTaxs = async (req, res) => {
  try {
    const newData = [];
    const orgId = req.params.orgId;
    const data = await taxModel.find({ orgId: orgId });
    data.forEach((element) => {
      if (element.globalTax === true) {
        newData.push(element);
      }
    });
    res.status(200).json({
      data: newData,
      code: 200,
      success: true,
      message: "all data get here!!",
    });
  } catch (error) {
    res.status(409).json(error.message);
  }
};

exports.updatetaxrates = async (req, res) => {
  try {
    const id = req.params.id;
    const { oldRate, newRate } = req.body;
    console.log(newRate, "newRate");
    console.log(oldRate, "oldRate");
    const data = await taxModel.findById(id);

    const i = data.taxRates.findIndex(function (entry) {
      return Object.keys(oldRate).every(function (key) {
        return entry[key] === oldRate[key];
      });
    });
    console.log(i, "I");
    var deleted = delete data.taxRates[i];
    console.log(deleted, "deleted");
    console.log(data.taxRates, "data.taxRates");

    res.status(200).json({
      code: 200,
      success: true,
      message: "updated",
    });
  } catch (error) {
    res.status(409).send("Some error has occured while updating.");
  }
};

exports.deletetaxRate = async (req, res) => {
  const _id = req.params.id;
  const objid = req.params.oid;
  console.log(_id);
  const data = await taxModel.findById(_id);
  console.log(data);
  try {
    const tax = await taxModel.updateOne(
      { _id: _id },
      { $pull: { taxRates: { _id: objid } } }
    );
    res.status(200).json({
      data: tax,
      code: 200,
      success: true,
      message: "deleted!",
    });
  } catch (error) {
    console.log(error);
    res.status(409).send("Some error has occured while updating.");
  }
};
