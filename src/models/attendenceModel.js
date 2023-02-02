const mongoose = require('mongoose');

const atdSchema = new mongoose.Schema({
    eid:{
        type : String
    },
    attendence:[{
        status:{type:String},
        date:{
             type:Date,
             default:Date.now,
         },
         entry:{type:Date,
            default:Date.now},
         exit:{type:Date},
         duration:{type:String}
        }],
    leaves:[{
        status:{type:String},
        from:{
            type:Date
        },
        to:{
            type:Date
        },
        reason:{
            type:String
        },
        adminStatus:{
            type:String,
            enum:["Accept","Reject"],
        default:"Awaiting"}
    }]
});

const atd = mongoose.model('atd',atdSchema);
module.exports = atd;