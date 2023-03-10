const mongoose = require('mongoose');
const { Schema } = mongoose;

const recurringInvoiceSchema = new Schema({
  amount: {
    type: Number,
    required: true
  },
  frequency: {
    type: String,
    required: true
  },
  start_date: {
    type: Date,
    required: true
  },
  end_date: {
    type: Date,
    required: true
  },
  customer_id: {
    type: String,
    required: true
  },
  invoice_id:{
    type:String,
    required:true
  }
});

module.exports = mongoose.model('RecurringInvoice', recurringInvoiceSchema);
