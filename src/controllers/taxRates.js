const mongoose = require("mongoose");
const taxModel = require("../models/taxModel");


exports.firsttaxrates=async(req,res)=>{
    try{
        const _id=req.params.Fid;
        const data=req.body.taxRates
        console.log(data);
        const tax= new taxModel({
            firm_id:_id,
            taxRates:data
        })
        await tax.save();
        res.status(201).json({
            data: tax,
            code: 201,
            success: true,
            message: "tax Rate inserted successfully!",
          });
    }
    catch(error){
        console.log(error);
        res.status(400).json({ message: "something went wrong! " });
    }
}

exports.gettaxrates=async(req,res)=>{
    try {
        const id = req.params.Fid;
        const data = await taxModel.find({firm_id:id}).sort({ id: -1 });
        res.status(200).json({
          data: data,
          code: 200,
          success: true,
          message: "all data get here!!",
        });
      } catch (error) {
        res.status(409).json(err.message);
      }
}

exports.updatetaxrates=async(req,res)=>{
    try {
        const _id = req.params.id;
        const taxid = req.params.tid;
        const data=await taxModel.update(
            {_id,"taxRates._id":taxid},{
                $set:{
                    "taxRates.$.cgst":req.body.cgst,
                    "taxRates.$.sgst":req.body.sgst,
                    "taxRates.$.igst":req.body.igst
                }
            }
        )
        res.status(200).json({
            data: data,
            code: 200,
            success: true,
            message: "updated",
          });
      } catch (error) {
        res.status(409).send("Some error has occured while updating.");
      }
}

exports.uaddtaxrates=async(req,res)=>{
    const _id=req.params.id;
    try{
        //console.log(_id);
        const tax = await taxModel.updateOne({ "_id": _id}, { $push: { taxRates: req.body.taxRates } })
        res.status(200).json({
            data: tax,
            code: 200,
            success: true,
            message: "all data get here!!",
          });
    }
    catch(error){
        res.status(409).send("Some error has occured while updating.");
    }
}

exports.deletetaxRate=async(req,res)=>{
    const _id=req.params.id;
    const objid=req.params.oid
    console.log(_id);
    const data=await taxModel.findById(_id)
    console.log(data);
    try{
        const tax = await taxModel.updateOne({ "_id": _id}, { $pull: { taxRates:{ _id:objid}}} )
        res.status(200).json({
            data: tax,
            code: 200,
            success: true,
            message: "deleted!",
          });
    }
    catch(error){
        console.log(error);
        res.status(409).send("Some error has occured while updating.");
    }
}