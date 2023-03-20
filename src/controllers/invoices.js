const express = require("express");
const mongoose = require("mongoose");
const InvoiceModel = require("../models/InvoiceModel.js");
const cron = require('node-cron');
const moment = require('moment');
const RecurringInvoiceModel = require("../models/RecurringInvoiceModel.js");
const winston = require('winston');
const schedule=require('node-schedule')

const logger = winston.createLogger({
  transports: [
    new winston.transports.File({ filename: 'invoices.json' })
  ]
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
  try {
    const allInvoices = await InvoiceModel.find({draft:false}).sort({ _id: -1 });

    res.status(200).json({
      data: allInvoices,
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
    tax
  } = req.body;
  // const newInvoice = new InvoiceModel(invoice);
  try {
    const allInvoice = await InvoiceModel.find();
    const newInvoice = new InvoiceModel({
      items: items,
      subTotal: subTotal,
      vat: vat,
      total: total,
      notes: notes,
      remark: remark,
      amount: amount,
      invoiceNumber:
        !allInvoice || allInvoice.length < 1 ? 1 : allInvoice.length + 1,
      dueDate,
      invoiceDate: invoiceDate,
      client: client,
      status: status,
      firm:firm,
      termsNcondition:termsNcondition,
      currency:currency,
      partialPay:partialPay,
      allowTip:allowTip,
      draft:draft,
      recurringInvoice:recurringInvoice,
      tax:tax
    });
    await newInvoice.save();
    // if(recurringInvoice.isEnabled==true){
    //   const newRecurr=new RecurringInvoiceModel({
    //     details:req.body,
    //     amount:total,
    //     frequency:recurringInvoice.frequency,
    //     start_date:invoiceDate,
    //     customer_id:client.client_id,
    //     end_date:recurringInvoice.end_date,
    //     invoice_id:newInvoice._id
    //   })
    //   await newRecurr.save();
    // }
    //   const job = schedule.scheduleJob(`* * * * * *`, () => {
    //     const now = new Date();
    //     if(now===newRecurr.end_date){
    //       const data= InvoiceModel.findById(invoice_id)
    //       console.log("naman",data);
    //       data.save();
    //     }
    //   })
      res.status(201).json({
      data: newInvoice,
      success: true,
      code: 201,
      message: "Invoice created successfully!",
    });
  } catch (error) {
    console.log(error);
    res.status(409).json({ message: "something went wrong." });
  }
};

exports.getInvoice = async (req, res) => {
  const { id } = req.params;
  try {
    const invoice = await InvoiceModel.findById(id);

    res.status(200).json({
      data: invoice,
      success: true,
      code: 200,
      message: "single invoice get",
    });
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

exports.updateInvoice = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).send("No invoice with that id");

  await InvoiceModel.findByIdAndUpdate(id,{ status: req.body.status });
  logger.info(`Invoice created: ${JSON.stringify(invoice)}`);
  res.json({message: "Status Updated successfully!!"});
};


exports.payment=async(req,res)=>{
  try {
    const _id=req.params.id;
    if (!mongoose.Types.ObjectId.isValid(_id)) 
    return res.status(404).send("No invoice with that id");
    const details=await InvoiceModel.findById(_id)
    const newPay=await InvoiceModel.findByIdAndUpdate(_id,{$push:{payment:req.body},$set:{status:req.body.status,amountPaid:parseFloat(details.amountPaid)+parseFloat(req.body.amountPaidpayment),dueAmount:parseFloat(details.total)-parseFloat(details.amountPaid)-parseFloat(req.body.amountPaidpayment)}},{
        new:true
      })
      console.log(newPay.amountPaid);
      if(newPay.dueAmount<0){
        amount=newPay.dueAmount
        return res.json({msg:"OverPaid!",amount})
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
}


exports.updateDraftIn = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).send("No Draft with that id");

  await InvoiceModel.findByIdAndUpdate(id,req.body);

  res.json({message: " Updated successfully!!"});
};

exports.getDrafts=async(req,res)=>{
  try{
    const data=await InvoiceModel.find({draft:true}).sort({ _id: -1 })
    res.json({
      data:data,
      status:201
    })
  }
  catch(error){
    res.status(401).json({message:"Something went wrong"})
  }
}

exports.getDraftByid=async(req,res)=>{
  const id=req.params.id;
  try{
    const data=await InvoiceModel.findById(id)
    res.json({
      data:data,
      status:201
    })
  }
  catch(error){
    res.status(401).json({message:"Something went wrong"})
  }
}

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY); 

exports.paymnetlink1= async (req, res) => { 
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
} 