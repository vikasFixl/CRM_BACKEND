const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Subscription =require("../models/subscriptionModel")
const user1 = require("../models/OrgModel")
const app = express();

app.use(bodyParser.json());

exports.createSubscription = async(req,res)=>{

    const user =req.body;
    const id =user.user
 
    try {
        const {
          user,
          planName,
          startDate,
          endDate,
          paymentMethod,
          transactionId,
        } = req.body;
    

        const subscription = new Subscription({
          user,
          planName,
          startDate,
          endDate,
          paymentMethod,
          transactionId,
        });

        user1.findByIdAndUpdate(id, {$set:{role: planName}},{new:true}, (err, user) => {
            if (err) {
              logger.error("Error updating user role:", err);
            } else {
              logger.info("User role updated successfully:", user.role);
            }
          });
        await subscription.save();
    
        res.status(201).json({
          success: true,
          message: 'Subscription created successfully',
          subscription,
        });
    
      } catch (error) {
        logger.error(error);
        res.status(500).json({
          success: false,
          message: 'Error creating subscription',
          error: error.message,
        });
      }
}
exports.getAllSubscription =async(req,res)=>{
    try {
        // Fetch all subscriptions from the database
        const subscriptions = await Subscription.find();
    
        res.status(200).json({
          success: true,
          message: 'Subscriptions retrieved successfully',
          subscriptions,
        });
      } catch (error) {
        logger.error(error);
        res.status(500).json({
          success: false,
          message: 'Error retrieving subscriptions',
          error: error.message,
        });
      }
}