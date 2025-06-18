import InvoiceModel from "../models/invoiceModel.js";
import taxModel from "../models/taxModel.js";
import { globalTaxSchema, taxSchema } from "../validations/tax/tax.js";
import mongoose from "mongoose";

export const addTaxInFirm = async (req, res) => {
  try {
    // Inject orgId and createdBy from token

    const orgId = req.orgUser.orgId; // assuming orgUser is attached by middleware
    const createdBy = req.user.userId; // assuming user is attached by middleware

    // // Construct final data to validate
    // const finalData = {
    //   firmId,
    //   orgId,
    //   createdBy,
    //   taxRates,
    // };

    const parsed = taxSchema.safeParse(req.body);
    console.log("zod data", parsed);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation error",
        errors: parsed.error.errors.map((e) => e.message),
      });
    }
    const tax = parsed.data;

    const existing = await taxModel.findOne({ firmId: tax.firmId });

    if (!existing) {
      await new taxModel({
        firmId: tax.firmId,
        orgId,
        createdBy,
        taxRates: tax.taxRates,
        isGlobal: false,
      }).save();
      return res.status(201).json({
        code: 201,
        success: true,
        message: "Firm tax created successfully!",
      });
    }

    // Push new tax rates to existing document
    await taxModel.updateOne(
      { _id: existing._id },
      { $push: { taxRates: { $each: tax.taxRates } } }
    );

    return res.status(201).json({
      code: 201,
      success: true,
      message: "Firm tax updated successfully!",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
export const postGlobalTax = async (req, res) => {
  try {
    // Validate input
    const orgId = req.orgUser.orgId;
    const parsed = globalTaxSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation error",
        errors: parsed.error.errors.map((e) => e.message),
      });
    }
const tax=parsed.data
    // Check if a global tax already exists for this org
    const existing = await taxModel.findOne({
      orgId: tax.orgId,
      firmId: null,
      isGlobal: true,
    });

    if (!existing) {
      const newTax = new taxModel({
        orgId,
        taxRates: tax.taxRates,
        firmId: null,
        isGlobal: true,
        createdBy: req.user?.userId,
      });
      await newTax.save();

      return res.status(201).json({
        code: 201,
        success: true,
        message: "Global tax created successfully!",
      });
    }

    // Update existing global tax by pushing new tax rates
    await taxModel.updateOne(
      { _id: existing._id },
      { $push: { taxRates: { $each: tax.taxRates } } }
    );

    return res.status(200).json({
      code: 200,
      success: true,
      message: "Global tax updated successfully!",
    });
  } catch (error) {
    console.error("Error in postGlobalTax:", error);

    if (error.name === "ZodError") {
      return res.status(422).json({
        message: "Validation Error",
        errors: error.errors,
        success: false,
      });
    }

    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
      success: false,
    });
  }
};

export const gettaxrates = async (req, res) => {
  try {
    const firmId = req.params.firmId;
    if(!firmId || !mongoose.Types.ObjectId.isValid(firmId)){
      return res.status(400).json({
        message: "Firm ID not found or invalid id",
        success: false,
      });
    }
    const data = await taxModel.find({ firmId }).sort({ id: -1 });
    res.status(200).json({
      message: "All tax rates fetched successfully!",
      success: true,
      total: data.length,
      code: 200,
      data,
    });
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

export const getGlobalTaxs = async (req, res) => {
  try {
    const orgId = req.orgUser?.orgId;

    if (!orgId) {
      return res.status(400).json({
        message: "Organization ID not found in token.",
        success: false,
      });
    }

    const data = await taxModel.find({
      orgId,
      isGlobal: true, // Ensure you're using 'isGlobal' if your schema uses it
    }).select("-__v -updatedAt"); // Exclude unnecessary fields if needed

    res.status(200).json({
      message: "Global taxes fetched successfully!",
      code: 200,
      success: true,
      total: data.length,
      data,
    });
  } catch (error) {
    console.error("Error fetching global taxes:", error.message);
    res.status(500).json({
      message: "Failed to fetch global taxes.",
      success: false,
      error: error.message,
    });
  }
};

export const getAllTaxes = async (req, res) => {
  try {
    const orgId = req.orgUser.orgId;

    // Get all taxes with limited firm fields populated
    const data = await taxModel.find({ orgId }).populate({
      path: "firmId",
      select: "FirmName _id email invoicePrefix",
    });

    // Shape the data
    const newData = data.map((element) => ({
      global: element.globalTax,
      id: element._id,
      firmId: element.firmId, // Already limited to selected fields
      taxRates: element.taxRates,
      isGlobal: element.isGlobal,
    }));

    res.status(200).json({
      message: "All taxes fetched successfully!",
      code: 200,
      success: true,
      total: data.length,
      data: newData,
    });
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

export const updatetaxrates = async (req, res) => {
  try {
    const id = req.params.id;
    const { oldRate, newRate } = req.body;
    const data = await taxModel.findById(id);

    const i = data.taxRates.findIndex((entry) =>
      Object.keys(oldRate).every((key) => entry[key] === oldRate[key])
    );

    if (i !== -1) {
      data.taxRates[i] = newRate;
      await data.save();
    }

    res.status(200).json({
      message: "Tax rate updated!",
      code: 200,
      success: true,
    });
  } catch (error) {
    res.status(409).send("Some error has occurred while updating.");
  }
};
export const disabletaxRate = async (req, res) => {
  try {
    const taxid = req.params.id;
    if(!taxid || !mongoose.Types.ObjectId.isValid(taxid)){
      return res.status(400).json({
        message: "Tax ID not found or invalid id",
        success: false,
      });
    }
    console.log(taxid);
    const tax= await taxModel.findOne({ _id: taxid });
  
    if(!tax){
      return res.status(400).json({
        message: "Tax not found",
        success: false,
      });
    }
console.log(tax);
    tax.taxRates[0].isEnabled = false;
    await tax.save();
    res.status(200).json({
      message: `${tax.taxRates[0].name} tax rate disabled successfully!`,
      code: 200,
      success: true,
      data: tax,
    });
    
  } catch (error) {
    
  }

}
export const deletetaxRate = async (req, res) => {
  try {
    const _id = req.params.id;
    const objid = req.params.oid;

    const tax = await taxModel.updateOne(
      { _id },
      { $pull: { taxRates: { _id: objid } } }
    );

    res.status(200).json({
      data: tax,
      code: 200,
      success: true,
      message: "Tax rate deleted!",
    });
  } catch (error) {
    res.status(409).send("Some error has occurred while deleting.");
  }
};

export const clientByTax = async (req, res) => {
  try {
    const { orgId, tax } = req.body;
    const data = await InvoiceModel.find({
      orgId,
      tax,
    }).select("client taxAmt -_id");

    const taxAmtSumDict = {};

    data.forEach((obj) => {
      const clientId = obj.client.client_id;
      const taxAmt = obj.taxAmt.length > 0 ? obj.taxAmt[0] : {};
      const taxAmtString = JSON.stringify(taxAmt);

      taxAmtSumDict[clientId] = taxAmtSumDict[clientId] || {};
      taxAmtSumDict[clientId][taxAmtString] =
        (taxAmtSumDict[clientId][taxAmtString] || 0) +
        Object.values(taxAmt).reduce((acc, val) => acc + parseInt(val), 0);
    });

    const result = [];

    for (const clientId in taxAmtSumDict) {
      for (const taxAmtString in taxAmtSumDict[clientId]) {
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

    res.status(200).json({
      data: result,
      message: "List of clients according to tax.",
      success: true,
      code: 200,
    });
  } catch (err) {
    res.status(400).json({
      message: err.message || "Error fetching client by tax.",
      success: false,
      code: 400,
    });
  }
};

export const invoiceByTax = async (req, res) => {
  try {
    const { orgId, tax, taxAmt } = req.body;
    const data = await InvoiceModel.find({
      orgId,
      tax,
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
      message: err.message || "Error fetching invoice by tax.",
      success: false,
    });
  }
};
