import mongoose from "mongoose";

// import winston from "winston";

// Adjust import paths if needed depending on file location
import InvoiceModel from "../models/InvoiceModel.js";
import ActivityModel from "../models/activityModel.js";
// import RecurringInvoiceModel from "../models/RecurringInvoiceModel.js";

// Logger setup
// const logger = winston.createLogger({
//   transports: [
//     new winston.transports.File({ filename: "invoices.json" }),
//   ],
// });
// export { logger };
import { invoiceSchema } from "../validations/invoice/invoicevalidation.js";
import { paginateQuery } from "../utils/pagination.js";

function generateNewInvoiceNumber(prefix = "INV") {
  const now = new Date();
  const timestamp = now.toISOString().replace(/\D/g, "").slice(0, 10); // YYYYMMDDHHMMSS

  const randomComponent = Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase(); // 6-char alphanumeric

  const invoiceNumber = `${prefix}-${timestamp}-${randomComponent}`;
  return invoiceNumber;
}

export const createInvoice = async (req, res) => {
  try {
    // ✅ Validate the request
    const userId = req.user.userId;
    const loggedinuserEmail = req.user.email;

    const empid = req.orgUser.employeeId;
    const org_id = req.orgUser.orgId;
    const invoice = invoiceSchema.safeParse(req.body);
    if (!invoice.success) {
      return res.status(400).json({
        message: "Validation error",
        errors: invoice.error.issues.map((e) => ({
          path: e.path.join("."),
          message: e.message,
          expected: e.expected,
          received: e.received,
        })),
      });
    }

    const {
      invoiceDate,
      dueDate,
      subTotal,
      total,
      status,
      amountPaid,
      dueAmount,
      roundOff,
      draft,
      incluTax,
      partialPay,
      allowTip,
      recurringInvoice,
      items,
      tax,
      taxAmt,
      notes,
      remark,
      gstn,
      termsNcondition,
      currency,
      curConvert,
      client,
      firm,
      payment,
      recurringInvoiceObj,
      firmId,
    } = invoice.data;

    // ✅ Handle draft invoices separately if needed
    if (draft === true) {
      const draftInvoice = new InvoiceModel({
        invoiceNumber: generateNewInvoiceNumber(),
        invoiceDate,
        dueDate,
        subTotal,
        total,
        status,
        amountPaid,
        dueAmount,
        roundOff,
        draft,
        incluTax,
        partialPay,
        allowTip,
        recurringInvoice,
        items,
        tax,
        taxAmt,

        notes,
        remark,
        gstn,
        termsNcondition,
        currency,
        curConvert,
        client,
        firm,
        payment,
        recurringInvoiceObj,
        orgId: org_id,
        firmId: firmId,
      });
      const savedDraft = await draftInvoice.save();
      const activity = new ActivityModel({
        activityDesc: ` draft invoice created by ${loggedinuserEmail} with id ${empid}`,
        userId,
        orgId: org_id,
        activity: "create",
        module: "invoice",
        entityId: savedDraft._id,
      });
      await activity.save();
      return res.status(201).json({
        success: true,
        code: 201,
        message: "Draft invoice created successfully!",
        data: savedDraft,
      });
    }

    // ✅ Handle regular invoices
    const newInvoice = new InvoiceModel({
      invoiceNumber: generateNewInvoiceNumber(),
      invoiceDate,
      dueDate,
      subTotal,
      total,
      status,

      amountPaid,
      dueAmount,
      roundOff,
      draft,
      incluTax,
      partialPay,
      allowTip,
      recurringInvoice,
      items,
      tax,
      taxAmt,
      notes,
      remark,
      gstn,
      termsNcondition,
      currency,
      curConvert,
      client,
      firm,
      payment,
      recurringInvoiceObj,
      orgId: org_id,
      firmId: firmId,
    });
    const savedInvoice = await newInvoice.save();
    const activity = new ActivityModel({
      activityDesc: `invoice created by ${loggedinuserEmail} with id ${empid}`,
      userId,
      orgId: org_id,
      activity: "create",
      module: "invoice",
      entityId: savedInvoice._id,
    });

    await activity.save();
    res.status(201).json({
      success: true,
      code: 201,
      message: "Invoice created successfully!",
      data: savedInvoice,
    });
  } catch (error) {
    console.error("Invoice Creation Error:", error);
    res.status(500).json({
      success: false,
      code: 500,
      message: "Something went wrong during invoice creation.",
    });
  }
};

// exports.getInvoicesByUser = async (req, res) => {
//   const { searchQuery } = req.query;

//   try {
//     const invoices = await InvoiceModel.find({ creator: searchQuery });
//     res.status(200).json({ data: invoices });
//   } catch (error) {
//     res.status(404).json({ message: error.message });
//   }
// };

// exports.getTotalCount = async (req, res) => {
//   const { searchQuery } = req.query;

//   try {
//     // const invoices = await InvoiceModel.find({ creator: searchQuery });
//     const totalCount = await InvoiceModel.countDocuments({
//       creator: searchQuery,
//     });

//     res.status(200).json(totalCount);
//   } catch (error) {
//     res.status(404).json({ message: error.message });
//   }
// };

export const getAllInvoices = async (req, res) => {
  const orgId = req.orgUser.orgId;

  const { page = 1, limit = 10, status, startDate, endDate } = req.query;
  console.log(req.query);
  try {
    const query = {
      orgId,
      delete: { $ne: true },
    };

    // Optional: Filter by status
    if (status) {
      query.status = status;
    }

    if (startDate || endDate) {
  query.createdAt = {};

  if (startDate) {
    query.createdAt.$gte = new Date(startDate);
  }

  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // ⬅️ include the full day
    query.createdAt.$lte = end;
  }
}
    console.log(startDate, endDate);

    // Pagination logic
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [total, invoices] = await Promise.all([
      InvoiceModel.countDocuments(query),
      InvoiceModel.find(query)
        .select("invoiceNumber status firm client")
        .populate("firm", "name id")
        
        .populate("firm")

        .sort({ _id: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
    ]);
    // Map result to return formatted client name
    const formatted = invoices.map((inv) => ({
      _id: inv._id,
      invoiceNumber: inv.invoiceNumber,
      firmName: inv.firm?.name || "-",
      clientName: `${inv.client?.firstName || ""} ${
        inv.client?.lastName || ""
      }`.trim(),
      clientemail: inv.client?.email || "-",
      clientaddress: inv.client?.address || "-",
      status: inv.status,
      firmId: inv.firm.firmId || null,
      clientId: inv.client.client_id || null,
      
      

    }));

    return res.status(200).json({
      message: "Invoices fetched successfully",
      success: true,
      code: 200,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
      data: formatted,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      code: 500,
      message: "Failed to retrieve invoices.",
      error: error.message,
    });
  }
};

export const getAllDeletedInvoices = async (req, res) => {
  try {
    const orgId = req.orgUser.orgId;
 const { page = 1, limit = 10 } = req.query;

    const query = {
      orgId,
      delete: true,
    };

    const options = {
      page,
      limit,
      sort: { invoiceDate: -1 },
    };

    const result = await paginateQuery(InvoiceModel, query, options);

    res.status(200).json({
      success: true,
      code: 200,
      message: "Deleted invoices fetched successfully!",
      ...result, // includes total, page, totalPages, limit, data
    });
   
  } catch (error) {
    console.error("Error fetching deleted invoices:", error);
    res.status(500).json({
      success: false,
      code: 500,
      message: "Server error while fetching deleted invoices.",
    });
  }
};

export const getInvoiceByClient = async (req, res) => {
  try {
    const orgId = req.orgUser.orgId;
    const { clientId } = req.body;

    if (!clientId) {
      return res.status(400).json({
        success: false,
        code: 400,
        message: " Client ID is required.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(clientId)) {
      return res.status(400).json({
        success: false,
        code: 400,
        message: "Invalid Client ID format.",
      });
    }
    const invoices = await InvoiceModel.find({
      orgId,
      "client.client_id": new mongoose.Types.ObjectId(clientId),
      delete: false,
    })
      .sort({ invoiceDate: -1 })
      .lean();
    console.log(invoices);

    res.status(200).json({
      success: true,
      code: 200,
      message: "Invoices fetched successfully!",
      data: invoices,
    });
  } catch (error) {
    console.error("Error fetching invoices by client:", error);
    res.status(500).json({
      success: false,
      code: 500,
      message: "Server error while fetching client invoices.",
    });
  }
};

export const getInvoiceByFirm = async (req, res) => {
  const orgId = req.orgUser.orgId;
  const { firmId } = req.body;
  if (!firmId) {
    return res.status(400).json({
      success: false,
      code: 400,
      message: " Firm ID is required.",
    });
  }
  try {
    const Invoice = await InvoiceModel.find({
      orgId: { $in: [orgId] },
      "firm.firmId": firmId,
      delete: false,
    }).sort({
      _id: -1,
    });
    res.status(200).json({
      data: Invoice,
      success: true,
      code: 200,
      message: "all invoices get here!!",
    });
  } catch (error) {
    res.status(409).json(error.message);
  }
};

export const listInvoiceNo = async (req, res) => {
  const orgId = req.orgUser.orgId;
  const { firmId } = req.body;

  if (!orgId || !firmId) {
    return res.status(400).json({
      success: false,
      code: 400,
      message: "orgId and firmId are required.",
    });
  }

  try {
    const invoices = await InvoiceModel.find({
      orgId,
      "firm.firmId": firmId,
      delete: false,
    })
      .sort({ _id: -1 })
      .select("invoiceNumber");

    if (invoices.length === 0) {
      return res.status(200).json({
        data: [],
        success: true,
        code: 200,
        message: "No invoices found for this firm.",
      });
    }

    const invoiceNumbers = invoices.map((inv) => inv.invoiceNumber);

    return res.status(200).json({
      data: invoiceNumbers,
      success: true,
      code: 200,
      message: "Invoice number list fetched successfully.",
    });
  } catch (error) {
    console.error("Error listing invoice numbers:", error);
    return res.status(500).json({
      success: false,
      code: 500,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};

// get single invice
export const getSingleInvoice = async (req, res) => {
  const { id } = req.body;

  if (!id && !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      code: 400,
      message: "Invalid invoice ID || id not found.",
    });
  }

  try {
    const invoice = await InvoiceModel.findOne({
      _id: id,
      delete: false,
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        code: 404,
        message: "Invoice not found.",
      });
    }

    return res.status(200).json({
      data: invoice,
      success: true,
      code: 200,
      message: "Single invoice fetched successfully.",
    });
  } catch (error) {
    console.error("Error fetching invoice:", error);
    return res.status(500).json({
      success: false,
      code: 500,
      message: "Internal Server Error.",
      error: error.message,
    });
  }
};
export const getAllCancelInvoices = async (req, res) => {
  try {
    const orgId = req.orgUser.orgId;
  const { page = 1, limit = 10 } = req.query;

    const query = {
      orgId,
      cancel: { $ne: false }, // Only include invoices where cancel === true
      delete: { $ne: true },  // Exclude deleted invoices
    };

    const options = {
      page,
      limit,
      sort: { invoiceDate: -1 },
    };

    const result = await paginateQuery(InvoiceModel, query, options);

    res.status(200).json({
      success: true,
      code: 200,
      message: "Cancelled invoices fetched successfully!",
      ...result, // Includes: total, page, limit, totalPages, data
    });
  } catch (error) {
    console.error("Error fetching cancelled invoices:", error);
    res.status(500).json({
      success: false,
      code: 500,
      message: "Server error while fetching cancelled invoices.",
    });
  }
};
   

// cancel invoice
export const cancelInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const loggedinuserEmail = req.user.email;

    const empid = req.orgUser.employeeId;
    const org_id = req.orgUser.orgId;

    // ✅ Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        code: 400,
        message: "Invalid invoice ID",
      });
    }

    // ✅ Update the invoice
    const updatedInvoice = await InvoiceModel.findByIdAndUpdate(
      id,
      {
        cancel: true,
        status: "Canceled",
      },
      { new: true } // returns the updated document
    );

    if (!updatedInvoice) {
      return res.status(404).json({
        success: false,
        code: 404,
        message: "Invoice not found",
      });
    }
    const activity = new ActivityModel({
      activityDesc: `Invoice Canceled By ${loggedinuserEmail} with id ${empid}`,
      module: "invoice",
      activity: "cancel",
      orgId: org_id,
      entityId: updatedInvoice._id,
      empId: empid,
      userId: userId,
    });
    await activity.save();
    // ✅ Success response
    res.status(200).json({
      success: true,
      code: 200,
      message: "Invoice canceled successfully!",
      data: updatedInvoice,
    });
  } catch (error) {
    console.error("Error canceling invoice:", error);
    res.status(500).json({
      success: false,
      code: 500,
      message: "Server error while canceling invoice",
    });
  }
};

//restore firm
export const restoreInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const loggedinuserEmail = req.user.email;

    const empid = req.orgUser.employeeId;
    const orgId = req.orgUser.orgId;

    // ✅ Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        code: 400,
        message: "Invalid invoice ID",
      });
    }
    const invoice = await InvoiceModel.findOne({
      _id: id,
      delete: { $ne: false },
    });
    if (!invoice) {
      return res.status(404).json({
        success: false,
        code: 404,
        message: "Invoice not found",
      });
    }

    // ✅ Restore the deleted invoice
    const restoredInvoice = await InvoiceModel.findByIdAndUpdate(
      id,
      { delete: false },
      { new: true } // return updated document
    );

    if (!restoredInvoice) {
      return res.status(404).json({
        success: false,
        code: 404,
        message: "Invoice not found",
      });
    }
    const activity = new ActivityModel({
      activityDesc: `Invoice Restored By ${loggedinuserEmail} with id ${empid}`,
      module: "invoice",
      activity: "restore",
      orgId: orgId,
      entityId: restoredInvoice._id,
      empId: empid,
      userId: userId,
    });
    await activity.save();
    // ✅ Success response
    res.status(200).json({
      success: true,
      code: 200,
      message: "Invoice restored successfully!",
      data: restoredInvoice,
    });
  } catch (error) {
    console.error("Restore Invoice Error:", error);
    res.status(500).json({
      success: false,
      code: 500,
      message: "Server error while restoring invoice",
    });
  }
};
// export const getInvoice = async (req, res) => {
//   const { id } = req.params;
//   const { orgId } = req.params;
//   const newData = [];
//   try {
//     const invoice = await InvoiceModel.find({ orgId: orgId });
//     invoice.forEach((element) => {
//       if (element._id == id) {
//         newData.push(element);
//       }
//     });
//     res.status(200).json({
//       data: newData,
//       success: true,
//       code: 200,
//       message: "single invoice get",
//     });
//   } catch (error) {
//     res.status(409).json({ message: error.message });
//   }
// };

//
//

//
// exports.updateInvoice = async (req, res) => {
//   const { id } = req.params;
//   const data = req.body;

//   if (!mongoose.Types.ObjectId.isValid(id))
//     return res.status(404).send("No invoice with that id");

//   await InvoiceModel.findByIdAndUpdate(id, data, { new: true });
//   res.json({ message: "Invoice Updated successfully!!" });
// };

export const moveToTrashInvoice = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;
  const loggedinuserEmail = req.user.email;

  const empid = req.orgUser.employeeId;
  const org_id = req.orgUser.orgId;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      message: "Invalid invoice ID",
      success: false,
      code: 400,
    });
  }

  try {
    const deletedInvoice = await InvoiceModel.findByIdAndUpdate(
      id,
      { delete: true },
      { new: true }
    );

    if (!deletedInvoice) {
      return res.status(404).json({
        message: "Invoice not found",
        success: false,
        code: 404,
      });
    }
    const activity = new ActivityModel({
      activityDesc: `Invoice moved to trash By ${loggedinuserEmail} with id ${empid}`,
      module: "invoice",
      activity: "delete",
      orgId: org_id,
      entityId: deletedInvoice._id,
      empId: empid,
      userId: userId,
    });
    await activity.save();
    res.status(200).json({
      message: "Invoice moved to trash successfully!",
      success: true,
      code: 200,
      data: deletedInvoice,
    });
  } catch (error) {
    console.error("Soft Delete Error:", error);
    res.status(500).json({
      message: "Something went wrong while deleting the invoice",
      success: false,
      code: 500,
    });
  }
};

export const restoreCancelInvoice = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;
  const loggedinuserEmail = req.user.email;

  const empid = req.orgUser.employeeId;
  const orgId = req.orgUser.orgId;
  // ✅ Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      message: "Invalid invoice ID",
      success: false,
      code: 400,
    });
  }

  try {
    const updatedInvoice = await InvoiceModel.findByIdAndUpdate(
      id,
      {
        cancel: false,
        status: "Pending",
      },
      { new: true }
    );

    if (!updatedInvoice) {
      return res.status(404).json({
        message: "Invoice not found",
        success: false,
        code: 404,
      });
    }
    const activity = new ActivityModel({
      activityDesc: `canceled Invoice restored By ${loggedinuserEmail} with id ${empid}`,
      module: "invoice",
      activity: "restore",
      orgId: orgId,
      entityId: updatedInvoice._id,
      empId: empid,
      userId: userId,
    });
    await activity.save();
    res.status(200).json({
      message: "Canceled invoice restored successfully!",
      success: true,
      code: 200,
    });
  } catch (error) {
    console.error("Restore Cancel Invoice Error:", error);
    res.status(500).json({
      message: "Something went wrong while restoring the invoice",
      success: false,
      code: 500,
    });
  }
};

export const permanentDeleteInvoice = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;
  const loggedinuserEmail = req.user.email;

  const empid = req.orgUser.employeeId;
  const orgId = req.orgUser.orgId;

  // ✅ Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      message: "Invalid invoice ID",
      success: false,
      code: 400,
    });
  }

  try {
    const deletedInvoice = await InvoiceModel.findByIdAndDelete(id);

    // ✅ Check if invoice existed
    if (!deletedInvoice) {
      return res.status(404).json({
        message: "Invoice not found",
        success: false,
        code: 404,
      });
    }

    const activity = new ActivityModel({
      activityDesc: `Invoice permanently deleted By ${loggedinuserEmail} with id ${empid}`,
      module: "invoice",
      activity: "delete",
      orgId: orgId,
      entityId: deletedInvoice._id,
      empId: empid,
      userId: userId,
    });
    await activity.save();
    res.status(200).json({
      message: "Invoice permanently deleted successfully!",
      success: true,
      code: 200,
    });
  } catch (error) {
    console.error("Invoice Deletion Error:", error);
    res.status(500).json({
      message: "An error occurred while deleting the invoice.",
      success: false,
      code: 500,
    });
  }
};
// get all drafts
export const getDrafts = async (req, res) => {
  try {
    const orgId = req.orgUser.orgId;
 
    const { page = 1, limit = 10 } = req.query;

    const query = {
      orgId,
      draft: { $ne: false },
      delete: { $ne: true },
    };
    const options={
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 },
    }

    const result = await paginateQuery(InvoiceModel, query, options);
     
    // Map result to return formatted client name
    const formatted = result.data.map((inv) => ({
      _id: inv._id,
      invoiceNumber: inv.invoiceNumber,
      draft: inv.draft,
      cancel: inv.cancel,
   
      firmName: inv.firm?.name || "-",
      clientName: `${inv.client?.firstName || ""} ${
        inv.client?.lastName || ""
      }`.trim(),
      clientemail: inv.client?.email || "-",
      clientaddress: inv.client?.address || "-",
      status: inv.status,
      firmId: inv.firm.firmId || null,
      clientId: inv.client.client_id || null,
      
      

    }));


    res.status(200).json({
      message: "Draft invoices fetched successfully.",
      code: 200,
      success: true,
      Invoice:formatted,
    });
  } catch (error) {
    console.error("Error fetching draft invoices:", error);
    res.status(500).json({
      message: "Internal server error while fetching drafts.",
      success: false,
      code: 500,
    });
  }
};
// get cancel
export const getCancel = async (req, res) => {
  try {
    const orgId = req.orgUser.orgId;

    const canceledInvoices = await InvoiceModel.find({
      orgId,
      cancel: true,
      draft: false,
      delete: false,
    }).sort({ _id: -1 });

    res.status(200).json({
      data: canceledInvoices,
      code: 200,
      success: true,
      message: "Canceled invoices retrieved successfully.",
    });
  } catch (error) {
    console.error("Error fetching canceled invoices:", error);
    res.status(500).json({
      message: "Internal server error while fetching canceled invoices.",
      success: false,
      code: 500,
    });
  }
};

export const finalizeDraftInvoice = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;
  const loggedinuserEmail = req.user.email;

  const empid = req.orgUser.employeeId;
  const orgId = req.orgUser.orgId;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      message: "Invalid draft ID",
      success: false,
      code: 400,
    });
  }

  try {
    const updatedInvoice = await InvoiceModel.findByIdAndUpdate(
      id,
      { draft: false, status: "Pending" },
      { new: true }
    );

    if (!updatedInvoice) {
      return res.status(404).json({
        message: "Draft invoice not found",
        success: false,
        code: 404,
      });
    }
    const activity = new ActivityModel({
      activityDesc: `Draft invoice converted to final invoice by ${loggedinuserEmail} with id ${empid}`,
      module: "invoice",
      activity: "update",
      orgId: orgId,
      entityId: updatedInvoice._id,
      empId: empid,
      userId: userId,
    });
    res.status(200).json({
      message: "Draft invoice converted to final invoice successfully!",
      success: true,
      code: 200,
      data: updatedInvoice,
    });
  } catch (error) {
    console.error("Error converting draft to invoice:", error);
    res.status(500).json({
      message: "Internal server error",
      success: false,
      code: 500,
    });
  }
};
export const getDraftById = async (req, res) => {
  const { id } = req.params;

  try {
    const invoice = await InvoiceModel.findOne({
      _id: id,
      draft: true,
      delete: false,
    });

    if (!invoice) {
      return res
        .status(404)
        .json({
          message: "no draft Invoice not found",
          status: 404,
          success: false,
        });
    }

    res.status(200).json({
      data: invoice,
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching invoice by ID:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const updateInvoiceStatus = async (req, res) => {
  const statusenu = [
    "Pending",
    "Paid",
    "Overdue",
    "Partial Paid",
    "Draft",
    "Canceled",
  ];
  const { id } = req.params;
  const orgId = req.orgUser.orgId;
  const { status } = req.body;
  const userId = req.user.userId;
  const loggedinuserEmail = req.user.email;

  const empid = req.orgUser.employeeId;
  // const org_id = req.orgUser.orgId;
  if (!status || !statusenu.includes(status)) {
    return res.status(400).json({
      message: "Invalid invoice status",
      success: false,
      code: 400,
    });
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      message: "Invalid invoice ID",
      success: false,
      code: 400,
    });
  }

  try {
    const updatedInvoice = await InvoiceModel.findByIdAndUpdate(
      id,
      { status, orgId },
      { new: true, runValidators: true }
    );

    if (!updatedInvoice) {
      return res.status(404).json({
        message: "Invoice not found",
        success: false,
        code: 404,
      });
    }
    const activity = new ActivityModel({
      orgId: orgId,
      module: "invoice",
      entityId: id,
      activity: "update",
      activityDesc: `Invoice status updated to ${status}`,

      userId: userId,
      userEmail: loggedinuserEmail,
    });
    await activity.save();
    res.status(200).json({
      message: "Invoice status updated successfully!",
      success: true,
      code: 200,
      data: updatedInvoice,
    });
  } catch (error) {
    console.error("Error updating invoice status:", error);
    res.status(500).json({
      message: "Internal server error",
      success: false,
      code: 500,
    });
  }
};

// exports.payment = async (req, res) => {
//   try {
//     const _id = req.params.id;
//     if (!mongoose.Types.ObjectId.isValid(_id))
//       return res.status(404).send("No invoice with that id");
//     const details = await InvoiceModel.findById(_id);
//     const newPay = await InvoiceModel.findByIdAndUpdate(
//       _id,
//       {
//         $push: { payment: req.body },
//         $set: {
//           status: req.body.status,
//           amountPaid:
//             parseFloat(details.amountPaid) +
//             parseFloat(req.body.amountPaidpayment),
//           dueAmount:
//             parseFloat(details.total) -
//             parseFloat(details.amountPaid) -
//             parseFloat(req.body.amountPaidpayment),
//         },
//       },
//       {
//         new: true,
//       }
//     );
//     console.log(newPay.amountPaid);
//     if (newPay.dueAmount < 0) {
//       amount = newPay.dueAmount;
//       return res.json({ msg: "OverPaid!", amount });
//     }
//     res.status(201).json({
//       data: newPay,
//       success: true,
//       code: 201,
//       message: "Payment Record Inserted Succesfully!",
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(409).json({ message: "something went wrong." });
//   }
// };

//

// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// exports.paymnetlink1 = async (req, res) => {
//   const { product } = req.body;
//   const session = await stripe.checkout.sessions.create({
//     payment_method_types: ["card"],
//     line_items: [
//       {
//         price_data: {
//           currency: "inr",
//           product_data: {
//             name: product.name,
//           },
//           unit_amount: product.price * 100,
//         },
//         quantity: product.quantity,
//       },
//     ],
//     mode: "payment",
//     success_url: "http://localhost:3000/success",
//     cancel_url: "http://localhost:3000/cancel",
//   });
//   res.json({ id: session.id });
// };
// exports.totalsell = async (req, res) => {
//   try {
//     const data = await InvoiceModel.find();

//     if (data.length === 0) {
//       return res.status(404).json({
//         message: "No Data found.",
//         success: true,
//       });
//     }

//     const totalAmount = data.reduce((total, purchase) => {
//       return total + purchase.total;
//     }, 0);

//     console.log("totalamount", totalAmount);

//     return res.status(200).json({
//       totalAmount: totalAmount,
//       message: "List of purchases with total amount.",
//       success: true,
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ error: "Something Went Wrong" });
//   }
// };
