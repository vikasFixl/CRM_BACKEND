const express = require("express");
const mongoose = require("mongoose");
const InvoiceModel = require("../models/InvoiceModel.js");
const cron = require("node-cron");
const moment = require("moment");
const RecurringInvoiceModel = require("../models/RecurringInvoiceModel.js");
const winston = require("winston");
const schedule = require("node-schedule");

const logger = winston.createLogger({
  transports: [new winston.transports.File({ filename: "invoices.json" })],
});

exports.getInvoicesByUser = async (req, res) => {
  const { searchQuery } = req.query;

  try {
    const invoices = await InvoiceModel.find({ creator: searchQuery });
    res.status(200).json({ data: invoices });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

exports.getTotalCount = async (req, res) => {
  const { searchQuery } = req.query;

  try {
    // const invoices = await InvoiceModel.find({ creator: searchQuery });
    const totalCount = await InvoiceModel.countDocuments({
      creator: searchQuery,
    });

    res.status(200).json(totalCount);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

exports.getAllInvoices = async (req, res) => {
  const { orgId } = req.params;
  try {
    const Invoice = await InvoiceModel.find({
      orgId: { $in: [orgId] },
      draft: { $in: [false] },
      delete: { $in: [false] },
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

exports.getAllDeletedInvoices = async (req, res) => {
  const { orgId } = req.params;
  try {
    const Invoice = await InvoiceModel.find({
      orgId: { $in: [orgId] },
      draft: { $in: [false] },
      delete: { $in: [true] },
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

exports.getInvoiceByClient = async (req, res) => {
  const { orgId, clientId } = req.body;
  try {
    const Invoice = await InvoiceModel.find({
      orgId: { $in: [orgId] },
      "client.client_id": clientId,
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

exports.getInvoiceByFirm = async (req, res) => {
  const { orgId, firmID } = req.body;
  try {
    const Invoice = await InvoiceModel.find({
      orgId: { $in: [orgId] },
      "firm.firmID": firmID,
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

exports.getAllCancelInvoices = async (req, res) => {
  const { orgId } = req.params;
  try {
    const Invoice = await InvoiceModel.find({
      orgId: { $in: [orgId] },
      cancel: { $in: [true] },
      delete: { $in: [false] },
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

exports.createInvoice = async (req, res) => {
  const {
    items,
    subTotal,
    vat,
    total,
    notes,
    remark,
    client,
    amount,
    dueDate,
    invoiceDate,
    status,
    firm,
    termsNcondition,
    currency,
    partialPay,
    allowTip,
    draft,
    recurringInvoice,
    tax,
    desc,
    orgId,
  } = req.body;
  try {
    if (draft == true) {
      const newInvoice = new InvoiceModel(req.body);
      const newData = await newInvoice.save();
      res.status(201).json({
        data: newData,
        success: true,
        code: 201,
        message: "Invoice created successfully!",
      });
    } else {
      const newInvoice = new InvoiceModel({
        items: items,
        subTotal: subTotal,
        vat: vat,
        total: total,
        notes: notes,
        remark: remark,
        amount: amount,
        invoiceNumber: invoiceNumber,
        invoiceDate: invoiceDate,
        dueDate: dueDate,
        client: client,
        status: status,
        firm: firm,
        termsNcondition: termsNcondition,
        currency: currency,
        partialPay: partialPay,
        allowTip: allowTip,
        draft: draft,
        recurringInvoice: recurringInvoice,
        tax: tax,
        desc: desc,
        orgId: orgId,
      });
      await newInvoice.save();
      res.status(201).json({
        data: newInvoice,
        success: true,
        code: 201,
        message: "Invoice created successfully!",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(409).json({ message: "something went wrong." });
  }
};

exports.getInvoice = async (req, res) => {
  const { id } = req.params;
  const { orgId } = req.params;
  const newData = [];
  try {
    const invoice = await InvoiceModel.find({ orgId: orgId });
    invoice.forEach((element) => {
      if (element._id == id) {
        newData.push(element);
      }
    });
    res.status(200).json({
      data: newData,
      success: true,
      code: 200,
      message: "single invoice get",
    });
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

exports.lastInvoiceNo = async (req, res) => {
  const { orgId, firmId } = req.body;
  try {
    const Invoice = await InvoiceModel.find({
      orgId: { $in: [orgId] },
      "firm.firmID": firmId,
    }).sort({
      _id: -1,
    });
    console.log(Invoice[0].invoiceNumber);
    if (Invoice.length == 0) {
      res.status(200).json({
        data: 0,
        success: true,
        code: 200,
        message: "single invoice get",
      });
    } else {
      res.status(200).json({
        data: Invoice[0].invoiceNumber,
        success: true,
        code: 200,
        message: "single invoice get",
      });
    }
  } catch (error) {
    res.status(401).json({
      message: error.message,
      success: false,
    });
  }
};

exports.getSingleInvoice = async (req, res) => {
  const { id } = req.body;
  try {
    const invoice = await InvoiceModel.findById(id);
    res.status(200).json({
      data: invoice,
      success: true,
      code: 200,
      message: "Single invoice for share",
    });
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

exports.updateInvoice = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).send("No invoice with that id");

  await InvoiceModel.findByIdAndUpdate(id, { status: req.body.status });
  // logger.info(`Invoice created: ${JSON.stringify(invoice)}`);
  res.json({ message: "Status Updated successfully!!" });
};

exports.softDeleteInvoice = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).send("No invoice with that id");

  await InvoiceModel.findByIdAndUpdate(id, { delete: true });
  // logger.info(`Invoice moved to delete: ${JSON.stringify(invoice)}`);
  res.json({
    message: "Invoice moved to delete successfully!!",
    success: true,
    code: 200,
  });
};

exports.restoreInvoice = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).send("No invoice with that id");

  await InvoiceModel.findByIdAndUpdate(id, { delete: false });
  // logger.info(`Invoice restored: ${JSON.stringify(invoice)}`);
  res.json({
    message: "Invoice restored successfully!!",
    success: true,
    code: 200,
  });
};

exports.cancelInvoice = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).send("No invoice with that id");
  await InvoiceModel.findByIdAndUpdate(id, { cancel: true });
  // logger.info(`Invoice canceled delete: ${JSON.stringify(invoice)}`);
  res.json({
    message: "Invoice canceled successfully!!",
    success: true,
    code: 200,
  });
};

exports.restoreCancelInvoice = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).send("No invoice with that id");

  await InvoiceModel.findByIdAndUpdate(id, { cancel: false });
  // logger.info(`Cancel invoice restored: ${JSON.stringify(invoice)}`);
  res.json({
    message: "Cancel invoice restored successfully!!",
    success: true,
    code: 200,
  });
};

exports.deleteInvoice = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).send("No invoice with that id");

  await InvoiceModel.findByIdAndDelete(id);
  // logger.info(`Invoice deleted: ${JSON.stringify(invoice)}`);
  res.json({
    message: "Invoice deleted successfully!!",
    success: true,
    code: 200,
  });
};

exports.payment = async (req, res) => {
  try {
    const _id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(_id))
      return res.status(404).send("No invoice with that id");
    const details = await InvoiceModel.findById(_id);
    const newPay = await InvoiceModel.findByIdAndUpdate(
      _id,
      {
        $push: { payment: req.body },
        $set: {
          status: req.body.status,
          amountPaid:
            parseFloat(details.amountPaid) +
            parseFloat(req.body.amountPaidpayment),
          dueAmount:
            parseFloat(details.total) -
            parseFloat(details.amountPaid) -
            parseFloat(req.body.amountPaidpayment),
        },
      },
      {
        new: true,
      }
    );
    console.log(newPay.amountPaid);
    if (newPay.dueAmount < 0) {
      amount = newPay.dueAmount;
      return res.json({ msg: "OverPaid!", amount });
    }
    res.status(201).json({
      data: newPay,
      success: true,
      code: 201,
      message: "Payment Record Inserted Succesfully!",
    });
  } catch (error) {
    console.log(error);
    res.status(409).json({ message: "something went wrong." });
  }
};

exports.updateDraftIn = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).send("No Draft with that id");

  await InvoiceModel.findByIdAndUpdate(id, req.body);

  res.json({ message: " Updated successfully!!" });
};

exports.drafttoinvoice = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).send("No Draft with that id");

  await InvoiceModel.findByIdAndUpdate(id, { draft: false });

  res.status(201).json({
    message: " Updated successfully!!",
    success: true,
    status: 201,
  });
};

exports.getDrafts = async (req, res) => {
  try {
    const { orgId } = req.params;
    const newData = await InvoiceModel.find({
      orgId: { $in: [orgId] },
      draft: { $in: [true] },
      delete: { $in: [false] },
    }).sort({ _id: -1 });
    res.json({
      data: newData,
      status: 201,
      success: true,
      message: "Drafts.",
    });
  } catch (error) {
    res
      .status(401)
      .json({ message: "Something went wrong", status: 401, success: false });
  }
};

exports.getDraftByid = async (req, res) => {
  const id = req.params.id;
  try {
    const data = await InvoiceModel.findById(id);
    res.json({
      data: data,
      status: 201,
    });
  } catch (error) {
    res.status(401).json({ message: "Something went wrong" });
  }
};

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.paymnetlink1 = async (req, res) => {
  const { product } = req.body;
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "inr",
          product_data: {
            name: product.name,
          },
          unit_amount: product.price * 100,
        },
        quantity: product.quantity,
      },
    ],
    mode: "payment",
    success_url: "http://localhost:3000/success",
    cancel_url: "http://localhost:3000/cancel",
  });
  res.json({ id: session.id });
};
