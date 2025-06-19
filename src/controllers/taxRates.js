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
// check if tax already exists
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
    // gets all tax rates by firm
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

// returns all the global taxes 
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
 // get all taxes both global and firm
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
// updaet the tax rate
export const updateTaxRateById = async (req, res) => {
  try {
    const  taxRateId  = req.params.id; // ✅ taxRates[].id here taxRateId is taxrates._id for individual tax
    const { newRate } = req.body;
    console.log(newRate, taxRateId);
    if(!taxRateId || !mongoose.Types.ObjectId.isValid(taxRateId)){
      return res.status(400).json({
        message: "Tax rate ID not found or invalid id",
        success: false,
        code: 400
      });
    }
    if(!newRate){
      return res.status(400).json({
        message: "New rate not found",
        success: false,
        code: 400
      });
    }


    // Find the tax document that contains this taxRateId
    const data = await taxModel.findOne({ "taxRates._id": taxRateId });
    console.log(data);

    if (!data) {
      return res.status(404).json({
        message: "Tax rate not found.",
        success: false,
        code: 404
      });
    }
// update the rate 
    data.taxRates.map((element) => {
      if (element._id == taxRateId) {
        element.rate = newRate;
      }
    })

      await data.save();

      return res.status(200).json({
        message: "Tax rate updated successfully.",
        success: true,
        code: 200
      });
  
  } catch (err) {
    res.status(500).json({
      message: err.message || "Failed to update tax rate.",
      success: false,
      code: 500
    });
  }
};
// disable the tax rate
export const disabletaxRate = async (req, res) => {
  try {
    const taxid = req.params.id; // same the id is taxrates._id not hte global tax id
    if(!taxid || !mongoose.Types.ObjectId.isValid(taxid)){
      return res.status(400).json({
        message: "Tax ID not found or invalid id",
        success: false,
      });
    }
    console.log(taxid);
   const tax = await taxModel.findOne({ "taxRates._id": taxid });
  
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

// gets client by tax 
// 📘 Controller to get total tax collected per client for a specific taxRateId
export const clientByTax = async (req, res) => {
  try {
    const orgId = req.orgUser.orgId;
    const { taxRateId } = req.body;

    // ✅ Validate required fields
    if (!orgId || !taxRateId) {
      return res.status(400).json({
        message: "orgId and taxRateId are required.",
        success: false,
        code: 400
      });
    }

    // 🔍 Fetch invoices that have the specified taxRateId applied
    const data = await InvoiceModel.find({
      orgId,
      "tax.taxRateId": taxRateId // 📌 tax.taxRateId refers to each entry in form.tax[]
    }).select("client taxAmt invoiceNumber");

    // 🧮 Store tax total per client
    const taxAmtSumDict = {};

    data.forEach((invoice) => {
      const clientId = invoice.client.client_id;

      // 🎯 Find the specific tax entry in taxAmt matching the given taxRateId
      const matchedTax = invoice.taxAmt.find(
        (entry) => entry.taxRateId === taxRateId
      );

      if (!matchedTax) return;

      const amount = parseFloat(matchedTax.amount || 0);

      // 🗃 Initialize if this client is not yet recorded
      if (!taxAmtSumDict[clientId]) {
        taxAmtSumDict[clientId] = {
          total: 0,
          tax: matchedTax,
          client: invoice.client
        };
      }

      // ➕ Accumulate tax amount per client
      taxAmtSumDict[clientId].total += amount;
    });

    // 🛠 Format result
    const result = Object.entries(taxAmtSumDict).map(([client_id, value]) => ({
      client_id,
      taxAmt: value.tax,
      sum: value.total,
      firstName: value.client.firstName,
      lastName: value.client.lastName,
      clientFirmName: value.client.clientFirmName
    }));

    // ✅ Respond with client-wise tax data
    res.status(200).json({
      data: result,
      message: "List of clients according to tax.",
      success: true,
      code: 200
    });

  } catch (err) {
    // ❌ Handle errors
    res.status(400).json({
      message: err.message || "Error fetching client by tax.",
      success: false,
      code: 400
    });
  }
};


// 📘 Get all invoices that have a specific taxRateId applied and return their tax info
export const invoiceByTax = async (req, res) => {
  try {
    const orgId = req.orgUser.orgId;
    const { taxRateId } = req.body;

    // ✅ Validate required inputs
    if (!orgId || !taxRateId) {
      return res.status(400).json({
        message: "orgId and taxRateId are required.",
        success: false,
      });
    }

    // 🔍 Fetch all invoices for the given organization
    // Filter those that have the specified taxRateId inside their tax array (form.tax)
    const data = await InvoiceModel.find({
      orgId,
      "tax.taxRateId": taxRateId
    }).select("invoiceNumber taxAmt"); // Only get what's needed

    const result = [];

    // 🧠 Go through each invoice
    data.forEach((invoice) => {
      // 🧾 Each invoice has a taxAmt array that stores all calculated tax breakdowns
      // 🔁 Loop over taxAmt array to find the entry matching the requested taxRateId
      invoice.taxAmt.forEach((taxItem) => {
        if (taxItem.taxRateId === taxRateId) {
          // ✅ If match found, push invoice info with tax data into result
          result.push({
            invoiceId: invoice._id,
            invoiceNo: invoice.invoiceNumber,
            tax: taxItem,
          });
        }
      });
    });

    // ✅ Respond with filtered invoice data
    res.status(200).json({
      data: result,
      success: true,
      code: 200,
    });

  } catch (err) {
    // ❌ Catch and report any error
    res.status(400).json({
      message: err.message || "Error fetching invoices by tax.",
      success: false,
    });
  }
};


