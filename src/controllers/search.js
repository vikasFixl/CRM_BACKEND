const express =  require('express');
const mongoose =  require('mongoose');
const ClientModel = require('../models/ClientModel');
const InvoiceModel = require('../models/InvoiceModel');
const Profile = require('../models/ProfileModel');
const User = require('../models/userModel');

exports.getResult =  async (req,res) => {
    try{
    const search = req.body;
    const obj = Object.keys(search)[0];
    const obj_val = Object.values(search)[0];
    if(obj == "firstName") {
        var query = { firstName: { $in : obj_val } };
    } else if(obj == "lastName"){
        var query = {lastName: {$in: obj_val}}
    }

    const findResult = await User.find({
        obj : { $in: obj_val },
        // lastName: { $in: obj_val },
    });
    res.send(findResult);
}
catch(error){
    res.json({message:"Something went wrong."})
}
};