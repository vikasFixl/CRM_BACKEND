const mongoose = require('mongoose');

const taxSchema=mongoose.Schema({
    firm_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "FIRM",
        required: true,
    },
    taxRates:[{
        cgst:{type:Number},
        sgst:{type:Number},
        igst:{type:Number}
    }]
})

module.exports=mongoose.model("TAXRATES",taxSchema);
