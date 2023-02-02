const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    name:{
        type : String
    },
    userid:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    eid :{
        type: String,
        unique : true
    },
    gender :{
        type: String
    },
    dob :{
        type:String
    },
    doj :{
        type:String
    },
    dol :{
        type: Number
    },
    designation :{
        type : String
    },
    panno:{
        type:String
    },
    bankDetails:{
        accno:{
            type:String
        },
        ifsc:{
            type:String
        },
        bname:{
            type:String
        },
    },
    totalWorkingDays:{
        type:Number
    },
    month:[{
        "jan":{type:Number},
        "feb":{type:Number},
        "mar":{type:Number},
        "apr":{type:Number},
        "may":{type:Number},
        "jun":{type:Number},
        "jul":{type:Number},
        "aug":{type:Number},
        "sep":{type:Number},
        "oct":{type:Number},
        "nov":{type:Number},
        "dec":{type:Number}
    }],
    leaves:[{
        "jan":{type:Number},
        "feb":{type:Number},
        "mar":{type:Number},
        "apr":{type:Number},
        "may":{type:Number},
        "jun":{type:Number},
        "jul":{type:Number},
        "aug":{type:Number},
        "sep":{type:Number},
        "oct":{type:Number},
        "nov":{type:Number},
        "dec":{type:Number}
    }]
});

const employee = mongoose.model('employee',employeeSchema);
module.exports = employee;