const mongoose = require('mongoose');

const dedSchema=mongoose.Schema({
    eid:{
        type:String
    },
    pf:{type:Number},
    esic:{type:Number},
    da:{type:Number},
    ta:{type:Number},
    hra:{type:Number},
    bonus:{type:Number},
    otherd:[{type:Number}],
    tds:{type:Number}
})

const ded = mongoose.model('ded',dedSchema);
module.exports = ded;