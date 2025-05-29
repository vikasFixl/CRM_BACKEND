import cron from "node-cron";
import User from "../models/userModel.js";
import { OrganizationInvite } from "../models/OrganisationInviteModel.js";
import mongoose from "mongoose";

export const startUserCleanupCron = () => {
    // runs at 2am every data 
  cron.schedule("0 2 * * *", async () => {
    console.log("🧹 Running scheduled cleanup of old soft-deleted users...");

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    try {
      const result = await User.deleteMany({
        isDeleted: true,
        deletedAt: { $lte: thirtyDaysAgo },
      });

      console.log(`✅ Permanently deleted ${result.deletedCount} users.`);
    } catch (error) {
      console.error("❌ Error deleting old users:", error.message);
    }
  });

 // Runs every 30 seconds — good for testing
  cron.schedule("*/30 * * * * *", async () => {
    console.log("⏳ Checking for expired invitations...");

    const now = new Date();

    try {
      const result = await OrganizationInvite.updateMany(
        {
          expiresAt: { $lt: now },
          status: { $ne: "expired" },
        },
        {
          $set: {
            status: "expired",
            token: null,
        
          },
        }
      );

      if (result.modifiedCount > 0) {
        console.log(`✅ Expired ${result.modifiedCount} invitation(s).`);
      }
    } catch (error) {
      console.error("❌ Error updating expired invitations:", error.message);
    }
  });

};
