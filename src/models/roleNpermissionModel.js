const mongoose = require("mongoose");

const roleSchema=mongoose.Schema({
    role:{type:String},
    permission:{type:Array}
})

const role=mongoose.model("rolesNpermissions",roleSchema)
module.exports=role;