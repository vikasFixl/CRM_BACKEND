const mongoose = require('mongoose');

const salarySchema=mongoose.Schema({
    eid:{
        type:String
    },
    cycle:{type:Number},
    basicPay:{type:Number},
    totalSalpaid:{type:Number},
    salSlip:[{type:String}]
})

const sal = mongoose.model('sal',salarySchema);
module.exports = sal;