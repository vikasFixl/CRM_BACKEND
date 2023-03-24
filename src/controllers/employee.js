const empModel=require("../models/employeeModel");

exports.emp=async(req,res)=>{
    const data=await empModel.find();
    res.send(data)
}
////////////////////