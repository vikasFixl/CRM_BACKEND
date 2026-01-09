const mongoose = require("mongoose");
const salModel = require("../models/salModel");
const empModel = require("../models/employeeModel");
const dedModel = require("../models/dedModel");
const attModel = require("../models/attendenceModel");
const userModel = require("../models/userModel");

exports.paySlipgen = async (req, res) => {
    try {
        const empid = req.body.eid;
        const empData = await empModel.findOne({ "eid": empid })
        const userData = await userModel.findOne({ "eid": empid })
        const salData = await salModel.findOne({ "eid": empid })
        const dedData = await dedModel.findOne({ "eid": empid })
        const attData = await attModel.findOne({ "eid": empid })

        const bankDetails = empData.bankDetails
        const userDetails = {
            "firstName": userData.firstName,
            "lastName": userData.lastName,
            "email": userData.email,
            "role": userData.role,
            "phone": userData.phone
        }
        //logger.info(userDetails);
        const salDetails = salData.basicPay
        //logger.info(typeof (salDetails));
        const daAmount = (parseInt(salDetails) * parseInt(dedData.da)) / 100
        //logger.info(dedData);
        const esicAmount = (salDetails * dedData.esic) / 100
        const taAmount = ((salDetails) * (dedData.ta)) / 100
        const hraAmount = ((salDetails) * (dedData.hra)) / 100
        const tdsAmount = ((salDetails) * (dedData.tds)) / 100
        const pfAmount = ((salDetails + dedData.da) * (dedData.pf)) / 100
        const dedDetails = {
            "pf": pfAmount,
            "esic": esicAmount,
            "da": daAmount,
            "ta": taAmount,
            "hra": hraAmount,
            "bonus": dedData.bonus,
            "otherd": dedData.otherd,
            "tds": tdsAmount
        }
        const grossSal = salDetails +
            daAmount +
            taAmount +
            hraAmount +
            dedData.bonus +
            pfAmount +
            esicAmount +
            dedData.otherd +
            tdsAmount;
        const netSal = grossSal - (pfAmount + esicAmount + dedData.otherd + tdsAmount)

        res.json({
            "bankDetails": bankDetails,
            "userDetails": userDetails,
            "salDetails": salDetails,
            "dedDetails": dedDetails,
            "grossSal": grossSal,
            "netSal": netSal
        })
    } catch (error) {
        res.status(400).json({
            success:false,
            code:400,
            message:"Something went wrong"
        })
    }
}


exports.postSaldetails = async (req, res) => {
    try {
        const empid = req.params.eid;
        const sal = new salModel({
            eid: empid,
            basicPay: req.body.basicPay
        })
        await sal.save();
        res.status(201).json({
            success: true,
            code: 201,
            message: "Details Saved"
        })
    } catch (error) {
        res.status(401).json({
            success: false,
            code: 401,
            message: error.message
        })
    }
}

