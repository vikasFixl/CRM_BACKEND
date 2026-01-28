import cron from "node-cron";
import User from "../models/userModel.js";
import { sendEmail } from "../../config/nodemailer.config.js";
import { generateWelcomeEmail } from "../utils/helperfuntions/emailtemplate.js";
import logger from "../../config/logger.js";
// Runs every second

// export const runWelcomeEmail = () => {
//   logger.info(" Cron job function initialized");

//   cron.schedule("* * * * * ", async () => {
//     logger.info(" Cron job triggered");
//     try {
//      const users = await User.find({ hasReceivedWelcomeEmail: { $ne: true } });

//       logger.info(" Number of users:", users.length);

//       if (users.length > 0) logger.info(" Sending welcome emails...");

//       for (const user of users) {
//         const html = await generateWelcomeEmail(); 
//         await sendEmail(user?.email, "Welcome to FixlCRM!", html);

//         user.hasReceivedWelcomeEmail = true;
//         await user.save();
//       }

//       if (users.length > 0) logger.info(" Welcome emails sent.");
//     } catch (error) {
//       logger.error(" Error in cron job:", error);
//     }
//   });
// };





