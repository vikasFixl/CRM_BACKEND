const mongoose = require("mongoose");

const ActivitySchema = new mongoose.Schema({
  Activity: {
    Users:[{
      username:{type:String},
      purchase:{
        createpuchasedis:{type:String},
        deletepurchasedis:{type:String},
        updatepurchasedis:{type:String},
      },
      invoiceDis:{
        createinvoicedis:{type:String},
        deleteinvoicedis:{type:String},
        updateinvoicedis:{type:String},
      },
      leadDis:{type:String},
      firmDis:{type:String},
      vanderDis:{type:String},
      Dis:{type:String},
      salDis:{type:String},
    }]
  }
});
const ActivityModel = mongoose.model("ActivityModel", ActivitySchema);

module.exports = ActivityModel;
