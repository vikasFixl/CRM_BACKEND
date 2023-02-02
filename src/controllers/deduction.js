const mongoose = require("mongoose");
const dedModel=require("../models/dedModel");


exports.postDedDetails=async(req,res)=>{
    try {
        const empid=req.params.eid;
        const formData = req.body
        const ded=new dedModel({
            eid: empid,
            pf:req.body.pf,
            esic:req.body.esic,
            da:req.body.da,
            ta:req.body.ta,
            hra:req.body.hra,
            bonus:req.body.bonus,
            tds:req.body.tds
        })
        console.log(formData);
        await ded.save();
        res.status(201).json({
            success:true,
            code:201,
            message:"Details Saved"
        })
    } catch (error) {
        res.status(401).json({
            success:false,
            code:401,
            message:error.message
        })
    }
}