const { string, object } = require('joi');
const mongoose = require('mongoose');

const firmSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    add: Object,
    webiste: String,
    gst_no: String
});

const Firm = mongoose.model('Firm', firmSchema);

module.exports = Firm;