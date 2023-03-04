const express = require("express");
const mongoose = require("mongoose");
const InvoiceModel = require("../models/InvoiceModel.js");

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
    draft
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
      draft:draft
    });
    await newInvoice.save();
    res.status(201).json({
      data: newInvoice,
      success: true,
      code: 201,
      message: "Invoice created successfully!",
    });
  } catch (error) {
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

  res.json({message: "Status Updated successfully!!"});
};

exports.deleteInvoice = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) 
    return res.status(404).send("No invoice with that id");
 
  await InvoiceModel.findByIdAndRemove(id, {delete: true});

  res.json({ message: "Invoice deleted successfully" });
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