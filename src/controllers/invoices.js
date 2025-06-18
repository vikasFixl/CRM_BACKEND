import mongoose from "mongoose";

// import winston from "winston";

// Adjust import paths if needed depending on file location
import InvoiceModel from "../models/InvoiceModel.js";
// import RecurringInvoiceModel from "../models/RecurringInvoiceModel.js";

// Logger setup
// const logger = winston.createLogger({
//   transports: [
//     new winston.transports.File({ filename: "invoices.json" }),
//   ],
// });
// export { logger };
import { invoiceSchema } from "../validations/invoice/invoicevalidation.js";

function generateNewInvoiceNumber(prefix = "INV") {
  const now = new Date();
  const timestamp = now.toISOString().replace(/\D/g, "").slice(0, 14); // YYYYMMDDHHMMSS

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
      invoiceNumber,
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
        invoiceNumber,
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

      return res.status(201).json({
        success: true,
        code: 201,
        message: "Draft invoice created successfully!",
        data: savedDraft,
      });
    }

    // ✅ Handle regular invoices
    const newInvoice = new InvoiceModel({
      invoiceNumber,
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

  try {
    const invoices = await InvoiceModel.find({
      orgId,
      delete: { $ne: true },
    })
      .sort({ _id: -1 }) // Most recent first
      .lean(); // Return plain JS objects for performance

    res.status(200).json({
      data: invoices,
      success: true,
      code: 200,
      message: "All invoices retrieved successfully!",
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

    const invoices = await InvoiceModel.find({
      orgId,
      draft: false,
      delete: true,
    })
      .sort({ invoiceDate: -1 }) // More meaningful than _id
      .lean(); // Faster response as plain JS objects

    res.status(200).json({
      success: true,
      code: 200,
      message: "Deleted invoices fetched successfully!",
      data: invoices,
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

    const invoices = await InvoiceModel.find({
      orgId,
      cancel: { $ne: false }, // neams cancel equal to true
      delete: { $ne: true },
    })
      .sort({ invoiceDate: -1 })
      .lean();

    res.status(200).json({
      success: true,
      code: 200,
      message: "Cancelled invoices fetched successfully!",
      data: invoices,
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

export const softDeleteInvoice = async (req, res) => {
  const { id } = req.params;

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

    res.status(200).json({
      message: "Invoice moved to deleted successfully!",
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

export const deleteInvoice = async (req, res) => {
  const { id } = req.params;

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
    const drafts = await InvoiceModel.find({
      orgId,
      draft: { $ne: false },
      delete: { $ne: true },
    }).sort({ _id: -1 });

    res.status(200).json({
      data: drafts,
      code: 200,
      success: true,
      message: "Draft invoices fetched successfully.",
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

export const draftToInvoice = async (req, res) => {
  const { id } = req.params;

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
      return res.status(404).json({ message: "Invoice not found" });
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

// exports.updateDraftIn = async (req, res) => {
//   const { id } = req.params;

//   if (!mongoose.Types.ObjectId.isValid(id))
//     return res.status(404).send("No Draft with that id");

//   await InvoiceModel.findByIdAndUpdate(id, req.body);

//   res.json({ message: " Updated successfully!!" });
// };

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
