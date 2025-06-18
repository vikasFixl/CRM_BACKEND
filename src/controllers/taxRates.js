import InvoiceModel from "../models/invoiceModel.js";
import taxModel from "../models/taxModel.js";

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

exports.getAllTaxes = async (req, res) => {
  try {
    const newData = [];
    const orgId = req.params.orgId;
    const data = await taxModel.find({ orgId: orgId }).populate("firmId");
    data.forEach((element) => {
      console.log(element);
      newData.push({
        global: element.globalTax,
        firmId: element.firmId,
        taxRates: element.taxRates,
      });
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

exports.clientByTax = async (req, res) => {
  try {
    const { orgId, tax } = req.body;
    const data = await InvoiceModel.find({
      orgId: orgId,
      tax: tax,
    }).select("client taxAmt -_id");

    // create a dictionary object to store the sum of taxAmt values
    const taxAmtSumDict = {};

    data.forEach((obj) => {
      const clientId = obj.client.client_id;
      const taxAmt = obj.taxAmt.length > 0 ? obj.taxAmt[0] : {}; // get the first taxAmt object, or an empty object if the array is empty
      const taxAmtString = JSON.stringify(taxAmt); // convert the taxAmt object to a string to use it as a dictionary key

      if (!taxAmtSumDict[clientId]) {
        taxAmtSumDict[clientId] = {};
      }

      if (!taxAmtSumDict[clientId][taxAmtString]) {
        taxAmtSumDict[clientId][taxAmtString] = 0;
      }

      for (const key in taxAmt) {
        if (taxAmt.hasOwnProperty(key)) {
          taxAmtSumDict[clientId][taxAmtString] += parseInt(taxAmt[key]);
        }
      }
    });

    // create a new array with the sum of taxAmt values for each taxAmt object and client_id
    const result = [];

    for (const clientId in taxAmtSumDict) {
      if (taxAmtSumDict.hasOwnProperty(clientId)) {
        for (const taxAmtString in taxAmtSumDict[clientId]) {
          if (taxAmtSumDict[clientId].hasOwnProperty(taxAmtString)) {
            const taxAmt = JSON.parse(taxAmtString);
            const sum = taxAmtSumDict[clientId][taxAmtString];

            const foundObj = data.find(
              (obj) => obj.client.client_id.toString() === clientId
            );
            const firstName = foundObj?.client?.firstName;
            const lastName = foundObj?.client?.lastName;
            const clientFirmName = foundObj?.client?.clientFirmName;
            result.push({
              client_id: clientId,
              taxAmt,
              sum,
              firstName,
              lastName,
              clientFirmName,
            });
          }
        }
      }
    }
    res.status(200).json({
      data: result,
      message: "List of clients according to tax.",
      success: true,
      code: 200,
    });
  } catch (err) {
    res.status(400).json({
      message: err,
      success: false,
      code: 400,
    });
  }
};

exports.invoiceByTax = async (req, res) => {
  try {
    const { orgId, tax, taxAmt } = req.body;
    const data = await InvoiceModel.find({
      orgId: orgId,
      tax: tax,
    }).select("invoiceNumber taxAmt");
    const result = [];
    data.forEach((element) => {
      element.taxAmt.forEach((element1) => {
        if (Object.keys(element1).toString() === taxAmt) {
          result.push({
            invoiceId: element._id,
            invoiceNo: element.invoiceNumber,
            tax: element1,
          });
        }
      });
    });
    res.status(200).json({
      data: result,
      success: true,
      code: 200,
    });
  } catch (err) {
    res.status(400).json({
      message: err,
      success: false,
    });
  }
};
