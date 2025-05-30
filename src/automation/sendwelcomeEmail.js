import cron from "node-cron";
import User from "../models/userModel.js";
import { sendEmail } from "../../config/nodemailer.config.js";
import { generateWelcomeEmail } from "../utils/helperfuntions/emailtemplate.js";

// Runs every second

export const runWelcomeEmail = () => {
  console.log("✅ Cron job function initialized");

  cron.schedule("* * * * * ", async () => {
    console.log("⏰ Cron job triggered");
    try {
     const users = await User.find({ hasReceivedWelcomeEmail: { $ne: true } });

      console.log("👤 Number of users:", users.length);

      if (users.length > 0) console.log("📧 Sending welcome emails...");

      for (const user of users) {
        const html = await generateWelcomeEmail(); 
        await sendEmail(user?.email, "Welcome to FixlCRM!", html);

        user.hasReceivedWelcomeEmail = true;
        await user.save();
      }

      if (users.length > 0) console.log("✅ Welcome emails sent.");
    } catch (error) {
      console.error("❌ Error in cron job:", error);
    }
  });
};





