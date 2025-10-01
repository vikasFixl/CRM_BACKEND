import { OrganizationBilling } from "../models/OranizationBillingPlanModel.js";
import Org from "../models/OrgModel.js";
import cron from "node-cron"
import mongoose from "mongoose";

export const downgradeExpiredTrials = cron.schedule("0 0 * * *", async () => {
  console.log("🚀 Cron job started: Checking expired trials");
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const now = new Date();

    // 1. Find expired trial orgs
    const expiredTrials = await OrganizationBilling.find({
      paymentStatus: "trialing",
      status: "active",
      trialEndDate: { $lte: now }
    }).session(session);

    if (!expiredTrials.length) {
      console.log("ℹ️ No expired trials found");
      await session.endSession();
      return;
    }

    // 2. Get Free plan
    const freePlan = await BillingPlan.findOne({ code: "FREE" }).session(session);
    if (!freePlan) throw new Error("Free plan not found in BillingPlan collection");

    for (let trial of expiredTrials) {
      // 3. Inactivate old trial
      trial.status = "inactive";
      await trial.save({ session });

      // 4. Create FREE plan billing
      const newPlan = await OrganizationBilling.create(
        [
          {
            organizationId: trial.organizationId,
            billingPlanId: freePlan._id,
            planSnapshot: {
              name: freePlan.name,
              code: freePlan.code,
              planType: freePlan.planType,
              price: 0,
              billingCycle: "monthly",
              features: freePlan.features || [],
              limits: freePlan.limits || {}
            },
            subscriptionStartDate: now,
            paymentStatus: "free",
            status: "active",
            autoRenew: false,
            currency: freePlan.currency || "USD",
            createdBy: "system"
          }
        ],
        { session }
      );

      // 5. Update org with new billing
      await Org.findByIdAndUpdate(
        trial.organizationId,
        { currentBilling: newPlan[0]._id },
        { session }
      );

      console.log(`✅ Org ${trial.organizationId} downgraded from TRIAL to FREE`);
    }

    await session.commitTransaction();
    console.log("🎯 Cron job finished successfully");
  } catch (err) {
    await session.abortTransaction();
    console.error("❌ Error downgrading expired trials:", err);
  } finally {
    session.endSession();
  }
});
