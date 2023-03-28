const taxModel = require("../models/taxModel");

exports.addTaxInFirm = async (req, res) => {
  try {
    const tax = req.body;
    const data = await taxModel.findOne({ firmId: tax.firmId });
    console.log(data, "DATA");
    if (data === null) {
      const newTax = new taxModel(tax);
      newTax.save();
      res.status(201).json({
        code: 201,
        success: true,
        message: "Firm tax created successfully!",
      });
    } else {
      const tax = await taxModel.updateOne(
        { _id: data._id },
        { $push: { taxRates: req.body.taxRates } }
      );
      console.log(tax, "TAX");
      res.status(201).json({
        code: 201,
        success: true,
        message: "Firm tax updated successfully!",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "something went wrong! " });
  }
};

exports.postGlobalTax = async (req, res) => {
  try {
    const tax = req.body;
    const data = await taxModel.findOne({ globalTax: true });
    if (data === null) {
      const newTax = new taxModel(tax);
      newTax.save();
      res.status(201).json({
        code: 201,
        success: true,
        message: "Global tax created successfully!",
      });
    } else {
      const tax = await taxModel.updateOne(
        { _id: data._id },
        { $push: { taxRates: req.body.taxRates } }
      );
      console.log(tax, "TAX");
      res.status(201).json({
        code: 201,
        success: true,
        message: "Global tax updated successfully!",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "something went wrong! " });
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
    res.status(409).json(err.message);
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
    res.status(409).json(err.message);
  }
};

exports.updatetaxrates = async (req, res) => {
  try {
    const id = req.params.id;
    const { oldRate, newRate } = req.body;
    console.log(newRate, "newRate");
    const data = await taxModel.findById(id);
    // console.log(data, "data");
    console.log(oldRate, "oldRate");
    // const res = data.taxRates.includes(oldRate);
    const res = data.taxRates.filter(function (entry) {
      return Object.keys(oldRate).every(async function (key) {
        if (entry[key] == oldRate[key]) {
          console.log(Object.keys(entry), "entry[key]")
          console.log("Here");
          const data = await taxModel.updateOne(
            {}, { $set: { [Object.keys(entry)] : newRate } }
          );
          console.log(data)
        }
      });
    });
    // console.log(res, "res");

    // const taxid = req.params.tid;
    // const data = await taxModel.update(
    //   { _id, "taxRates._id": taxid },
    //   {
    //     $set: {
    //       "taxRates.$.cgst": req.body.cgst,
    //       "taxRates.$.sgst": req.body.sgst,
    //       "taxRates.$.igst": req.body.igst,
    //     },
    //   }
    // );
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
